package kotlinclient

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.runBlocking
import okhttp3.OkHttpClient
import retrofit2.Response
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
    suspend fun getUser(@Path("user") user: Int): Response<User>

    @GET("orders")
    suspend fun getOrders(@Query("by") user: Int, @Query("limit") limit: Int): Response<LastOrders>
}

interface DiscountService {
    @GET("discount")
    suspend fun getDiscount(@Query("score") score: Int,
                            @Query("orders") orders: Int,
                            @Query("totals") totals: Double,
                            @Query("first_order_date") firstOrderDate: String): Response<Discount>
}

fun main() = runBlocking(context = Dispatchers.IO) {
    val userId = 12345678
    val limit = 5

    // BUG Retrofit uses OkHttp internally as HTTP client, which in turn creates
    // non-daemon threads preventing the VM from termination.
    // WORKAROUND: explicitly create OkHttp client and also explicitly shut it down
    // at the end.
    val okHttpClient = OkHttpClient.Builder().build()

    val shopRetrofit: Retrofit = Retrofit.Builder()
        .baseUrl("http://localhost:4000/")
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
    val shopService: UserOrdersService = shopRetrofit.create(UserOrdersService::class.java)

    val deferredUser = async {
        shopService
            .getUser(12345678)
            .body()
    }
    val deferredOrders = async {
        shopService
            .getOrders(user = userId, limit = limit)
            .body()
    }

    val user = deferredUser.await()
    val score = user?.score ?: 0
    val orders = deferredOrders.await()
    val totals = orders?.last_orders?.sumOf { o: Order -> o.total } ?: 0.0
    val firstOrderDate = orders?.last_orders?.first()?.order_date ?: ""

    val discountObj = async {
        val discountRetrofit: Retrofit = Retrofit.Builder()
            .baseUrl("http://localhost:3000/")
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        val discountService: DiscountService =
            discountRetrofit.create(DiscountService::class.java)
        discountService
            .getDiscount(score, limit, totals, firstOrderDate)
            .body()
    }
    val discount = discountObj.await()?.discount ?: 0.0
    println("discount for user $userId: $discount")

    // BUGFIX Terminate all non-daemon threads created by Retrofit's OkHttp client.
    okHttpClient.dispatcher().executorService().shutdown()
    okHttpClient.connectionPool().evictAll()
}
