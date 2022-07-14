using System.Text.Json;

namespace cs_client
{
    public record User(int userid, string name, string email, string street, int zip, 
        string city, string state, string dob, string joined, int score);
    public record Order(string order_date, double total);
    public record LastOrders(List<Order> last_orders);
    public record Discount(double discount);

    class CSClient
    {
        public static readonly int userId = 12345678;
        public static readonly int limit = 5;
        public static readonly string host = "http://192.168.1.131";

        private static readonly HttpClient client = new HttpClient();

        static async Task<int> GetUserScore(int userId)
        {
            var response = client.GetStreamAsync($"{host}:4000/user/{userId}");
            var user = await JsonSerializer.DeserializeAsync<User>(await response);
            return (user == null) ? 0 : user.score;
        }
        static async Task<Order> GetLastOrders(int userId)
        {
            var response = client.GetStreamAsync($"{host}:4000/orders?by={userId}&limit={limit}");
            var lastOrders = await JsonSerializer.DeserializeAsync<LastOrders>(await response);
            string firstOrderDate = "";
            double total = 0;
            if (lastOrders != null && lastOrders.last_orders.Count > 0) {
                firstOrderDate = lastOrders.last_orders[0].order_date;
                total = lastOrders.last_orders.Select((o) => o.total).Sum();
            }
            Order order = new Order(firstOrderDate, total);
            return order;
        }

        static async Task<double> GetDiscount(int userScore, double totals,
                string firstOrderDate)
        {
            var response = client.GetStreamAsync(
                $"{host}:3000/discount?score={userScore}&orders={limit}&totals={totals}&first_order_date={firstOrderDate}");
            var discount = await JsonSerializer.DeserializeAsync<Discount>(await response);
            return (discount == null) ? 0.0 : discount.discount;
        }

        static async Task<double> GetDiscount(int userId)
        {
            Task<int> userScore = GetUserScore(userId);
            Task<Order> firstOrderAndLastTotal = GetLastOrders(userId);

            await Task.WhenAll(userScore, firstOrderAndLastTotal);
            int score = await userScore;
            Order order = await firstOrderAndLastTotal;
            Task<double> discount = GetDiscount(score, order.total, order.order_date);
            return await discount;
        }

        static async Task Main(string[] args)
        {
            double discount = await GetDiscount(userId);
            Console.WriteLine($"discount for user {userId}: {discount}");
        }
    }
}