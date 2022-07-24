package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
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
	user, err := getUser(UserID)
	if err != nil {
		panic(err)
	}
	lastOrders, err := getLastOrder(UserID, LIMIT)
	if err != nil {
		panic(err)
	}
	var firstOrderDate = lastOrders.LastOrders[0].OrderDate
	var orderTotals = 0.0
	for _, o := range lastOrders.LastOrders {
		orderTotals += o.Total
	}
	discount, err := getDiscount(user.Score, LIMIT, orderTotals, firstOrderDate)
	if err != nil {
		panic(err)
	}
	fmt.Println("discount:", discount)
}

func makeRequest(url string, result any) error {
	resp, err := http.Get(url)
	if err != nil {
		return fmt.Errorf("request failed: %s", err)
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("request failed - unable to read response: %s", err)
	}
	if err := json.Unmarshal(body, &result); err != nil {
		return fmt.Errorf("error while unmarshalling JSON: %s", err)
	}
	return nil
}

func getUser(uid int) (*User, error) {
	url := fmt.Sprintf("http://localhost:4000/user/%d", uid)
	user := &User{}
	err := makeRequest(url, user)
	return user, err
}

func getLastOrder(uid int, limit int) (*LastOrders, error) {
	url := fmt.Sprintf("http://localhost:4000/orders?by=%d&limit=%d", uid, limit)
	lastOrders := &LastOrders{}
	err := makeRequest(url, lastOrders)
	return lastOrders, err
}

func getDiscount(score int, numOrders int, totals float64, firstOrderDate string) (float64, error) {
	url := fmt.Sprintf("http://localhost:3000/discount?score=%d&orders=%d&totals=%f&first_order_date=%s",
		score, numOrders, totals, firstOrderDate)
	var discount Discount
	err := makeRequest(url, &discount)
	return discount.Discount, err
}
