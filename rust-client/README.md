# Asynchronous Client in Rust

- [client-tokio](client-tokio): Tokio is the de-facto asynchronous runtime for Rust. Uses asynchronous `reqwest` HTTP client for request and
  `serde` to deserialize the JSON response.
- [client-async-std](client-async-std): Uses the `async_std` asynchronous runtime. It seems that `reqwest` does not work in `async_std`.
  `surf` is used instead. `serde` is used to deserialize the JSON response.
- [client-seq](client-seq): Blocking client using `request` (`feature = ["blocking"]`) and `serde` for JSON deserialization.
