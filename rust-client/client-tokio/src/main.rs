use schema::{Discount, LastOrders, Order, User};
mod schema;

type Result<T> = std::result::Result<T, Box< dyn std::error::Error>>;

const USER_ID: u32 = 1234567;
const LIMIT: u32 = 5;

async fn get_user_score(user_id: u32) -> Result<u32> {
    let req_str = format!("http://localhost:4000/user/{}", user_id);
    let user = reqwest::get(req_str)
        .await?
        .json::<User>()
        .await?;
    Ok(user.score)
}

async fn get_last_orders(user_id: u32, num_last_orders: u32) -> Result<Vec<Order>> {
    let req_str = format!("http://localhost:4000/orders?by={}&limit={}", user_id, num_last_orders);
    let last_orders = reqwest::get(req_str)
        .await?
        .json::<LastOrders>()
        .await?;
    Ok(last_orders.last_orders)
}

async fn get_discount(score: u32, first_order_date: &str, limit: u32, order_totals: f64) -> Result<f64> {
   let req_str = format!("http://localhost:3000/discount?score={}&orders={}&totals={}&first_order_date={}",
        score, limit, order_totals, first_order_date);
    let discount = reqwest::get(req_str)
        .await?
        .json::<Discount>()
        .await?;
    Ok(discount.discount)
}

#[tokio::main]
async fn main() -> Result<()> {
    let (user_score, last_orders) = tokio::try_join!(
        get_user_score(USER_ID),
        get_last_orders(USER_ID, LIMIT)
    )?;
    let order_totals: f64 = last_orders.iter().map(|o| o.total).sum();
    let first_order_date: &str = &last_orders[0].order_date;

    let discount = get_discount(user_score, first_order_date, LIMIT, order_totals).await?;
    println!("discount: {}", discount);
    Ok(())
}
