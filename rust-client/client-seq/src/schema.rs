use serde::Deserialize;

#[derive(Deserialize, Debug)]
pub struct User {
  pub city: String,
  pub dob: String,
  pub email: String,
  pub joined: String,
  pub name: String,
  pub score: u32,
  pub state: String,
  pub street: String,
  pub userid: u32,
  pub zip: u32,
}

#[derive(Deserialize, Debug)]
pub struct Order {
  pub order_date: String,
  pub total: f64,
}

#[derive(Deserialize, Debug)]
pub struct LastOrders {
  pub last_orders: Vec<Order>,
}

#[derive(Deserialize, Debug)]
pub struct Discount {
  pub discount: f64,
}
