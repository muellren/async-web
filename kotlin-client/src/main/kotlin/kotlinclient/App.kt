package kotlinclient

import retrofit2.Call
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query

data class User(val name: String,
                val email: String,
                val street: String,
                val zip: Int,
                val city: String,
                val dob: String,
                val joined: String,
                val score: Int)

data class Order(val order_date: String,
                 val total: Double)

data class LastOrders(val last_orders: List<Order>)

data class Discount(val discount: Double)

interface UserOrdersService {
    @GET("user/{user}")
    fun getUser(@Path("user") user: Int): Call<User>

    @GET("orders")
    fun getOrders(@Query("by") user: Int, @Query("limit") limit: Int): Call<LastOrders>
}

interface DiscountService {
    @GET("discount")
    fun getDiscount(@Query("score") score: Int,
                    @Query("orders") orders: Int,
                    @Query("totals") totals: Double,
                    @Query("first_order_date") firstOrderDate: String): Call<Discount>
}

fun main() {
    val userId = 12345678
    val limit = 5

    val shopRetrofit: Retrofit = Retrofit.Builder()
        .baseUrl("http://localhost:4000/")
        .addConverterFactory(GsonConverterFactory.create())
        .build()
    val shopService: UserOrdersService = shopRetrofit.create(UserOrdersService::class.java)

    val discountRetrofit: Retrofit = Retrofit.Builder()
        .baseUrl("http://localhost:3000/")
        .addConverterFactory(GsonConverterFactory.create())
        .build()
    val discountService: DiscountService = discountRetrofit.create(DiscountService::class.java)

    val user = shopService
        .getUser(12345678)
        .execute()
        .body()

    val orders = shopService
        .getOrders(user = userId, limit = limit)
        .execute()
        .body()

    val score = user?.score ?: 0
    val totals = orders?.last_orders?.sumOf { o: Order -> o.total } ?: 0.0
    val firstOrderDate = orders?.last_orders?.first()?.order_date ?: ""

    val discountObj = discountService
        .getDiscount(score, limit, totals, firstOrderDate)
        .execute()
        .body()
    val discount = discountObj?.discount ?: 0.00
    println("discount for user $userId: $discount")
}
