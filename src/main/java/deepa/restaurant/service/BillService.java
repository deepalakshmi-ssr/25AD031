package deepa.restaurant.service;

import deepa.restaurant.entity.Bill;
import deepa.restaurant.entity.Order;
import deepa.restaurant.entity.RestaurantTable;
import deepa.restaurant.repository.BillRepository;
import deepa.restaurant.repository.OrderRepository;
import deepa.restaurant.repository.RestaurantTableRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BillService {

    private final BillRepository billRepository;
    private final OrderRepository orderRepository;
    private final RestaurantTableRepository restaurantTableRepository;

    public BillService(
            BillRepository billRepository,
            OrderRepository orderRepository,
            RestaurantTableRepository restaurantTableRepository) {

        this.billRepository = billRepository;
        this.orderRepository = orderRepository;
        this.restaurantTableRepository = restaurantTableRepository;
    }

    public Bill createBill(Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        if (!"OPEN".equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException(
                    "Bill can only be generated for an OPEN order"
            );
        }

        if (order.getTotalAmount() == null ||
                order.getTotalAmount() <= 0) {
            throw new RuntimeException(
                    "Order has no items. Cannot generate bill"
            );
        }

        Bill bill = new Bill();

        bill.setBillNumber("BILL-" + System.currentTimeMillis());
        bill.setBillDate(LocalDateTime.now());
        bill.setTotalAmount(order.getTotalAmount());
        bill.setPaymentStatus("PAID");
        bill.setOrder(order);

        order.setStatus("COMPLETED");
        orderRepository.save(order);

        RestaurantTable table = order.getRestaurantTable();

        table.setStatus("FREE");
        restaurantTableRepository.save(table);

        return billRepository.save(bill);
    }

    public List<Bill> getAllBills() {
        return billRepository.findAll();
    }

    public Bill getBillById(Long id) {

        return billRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Bill not found"));
    }

    public Bill updateBill(
            Long id,
            Bill updatedBill) {

        Bill existingBill = getBillById(id);

        if (updatedBill.getPaymentStatus() != null &&
                !updatedBill.getPaymentStatus().isBlank()) {

            existingBill.setPaymentStatus(
                    updatedBill.getPaymentStatus()
            );
        }

        return billRepository.save(existingBill);
    }

    public void deleteBill(Long id) {

        Bill bill = getBillById(id);

        billRepository.delete(bill);
    }
}