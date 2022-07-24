package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"

	"golang.org/x/sync/errgroup"
)

type User struct {
	City   string `json:"city"`
	Dob    string `json:"dob"`
	Email  string `json:"email"`
	Joined string `json:"joined"`
	Name   string `json:"name"`
	Score  int    `json:"score"`
	State  string `json:"state"`
	Street string `json:"street"`
	UserID int    `json:"userid"`
	Zip    int    `json:"zip"`
}

type Order struct {
	OrderDate string  `json:"order_date"`
	Total     float64 `json:"total"`
}

type LastOrders struct {
	LastOrders []Order `json:"last_orders"`
}

type Discount struct {
	Discount float64 `json:"discount"`
}

const UserID = 1234567
const LIMIT = 5

func main() {
	userChan := make(chan *User, 1)
	lastOrdersChan := make(chan *LastOrders, 1)

	errorGroup, _ := errgroup.WithContext(context.Background())

	errorGroup.Go(func() error { return getUser(UserID, userChan) })
	errorGroup.Go(func() error { return getLastOrder(UserID, LIMIT, lastOrdersChan) })

	err := errorGroup.Wait()
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
	user := <-userChan
	lastOrders := <-lastOrdersChan
	var firstOrderDate = lastOrders.LastOrders[0].OrderDate
	var orderTotals = 0.0
	for _, o := range lastOrders.LastOrders {
		orderTotals += o.Total
	}

	discountChan := make(chan *Discount, 1)
	errorGroup.Go(func() error { return getDiscount(user.Score, LIMIT, orderTotals, firstOrderDate, discountChan) })
	err = errorGroup.Wait()
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	discount := <-discountChan
	fmt.Println("discount:", discount.Discount)
}

func makeRequestAsync[T any](url string, rc chan *T) error {
	resp, err := http.Get(url)
	if err != nil {
		return fmt.Errorf("request failed: %s", err)
	}

	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed reading response: %s", err)
	}
	result := new(T)
	if err := json.Unmarshal(body, result); err != nil {
		return fmt.Errorf("failed parsing response JSON: %s", err)
	}
	rc <- result
	return nil
}

func getUser(uid int, rc chan *User) error {
	url := fmt.Sprintf("http://localhost:4000/user/%d", uid)
	return makeRequestAsync(url, rc)
}

func getLastOrder(uid int, limit int, rc chan *LastOrders) error {
	url := fmt.Sprintf("http://localhost:4000/orders?by=%d&limit=%d", uid, limit)
	return makeRequestAsync(url, rc)
}

func getDiscount(score int, numOrders int, totals float64, firstOrderDate string, rc chan *Discount) error {
	url := fmt.Sprintf("http://localhost:3000/discount?score=%d&orders=%d&totals=%f&first_order_date=%s",
		score, numOrders, totals, firstOrderDate)
	return makeRequestAsync(url, rc)
}
