package deepa.restaurant.service;

import deepa.restaurant.entity.Order;
import deepa.restaurant.entity.OrderItem;
import deepa.restaurant.repository.OrderItemRepository;
import deepa.restaurant.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderItemService {

    private final OrderItemRepository orderItemRepository;
    private final OrderRepository orderRepository;

    public OrderItemService(
            OrderItemRepository orderItemRepository,
            OrderRepository orderRepository) {

        this.orderItemRepository = orderItemRepository;
        this.orderRepository = orderRepository;
    }

    // CREATE ORDER ITEM
    public OrderItem createOrderItem(
            Long orderId,
            OrderItem orderItem) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        if (orderItem.getQuantity() == null ||
                orderItem.getQuantity() <= 0) {

            throw new RuntimeException(
                    "Quantity must be greater than zero");
        }

        if (orderItem.getUnitPrice() == null ||
                orderItem.getUnitPrice() < 0) {

            throw new RuntimeException(
                    "Unit price cannot be negative");
        }

        // Calculate item total
        double itemTotal =
                orderItem.getQuantity()
                        * orderItem.getUnitPrice();

        orderItem.setTotalPrice(itemTotal);
        orderItem.setOrder(order);

        OrderItem savedItem =
                orderItemRepository.save(orderItem);

        // Update order total
        updateOrderTotal(order);

        return savedItem;
    }

    // GET ALL ORDER ITEMS
    public List<OrderItem> getAllOrderItems() {
        return orderItemRepository.findAll();
    }

    // GET ITEMS BY ORDER
    public List<OrderItem> getItemsByOrderId(Long orderId) {

        if (!orderRepository.existsById(orderId)) {
            throw new RuntimeException("Order not found");
        }

        return orderItemRepository.findByOrderId(orderId);
    }

    // GET ORDER ITEM BY ID
    public OrderItem getOrderItemById(Long id) {

        return orderItemRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Order item not found"));
    }

    // UPDATE ORDER ITEM
    public OrderItem updateOrderItem(
            Long id,
            OrderItem updatedItem) {

        OrderItem existingItem =
                getOrderItemById(id);

        Order order = existingItem.getOrder();

        if (updatedItem.getQuantity() == null ||
                updatedItem.getQuantity() <= 0) {

            throw new RuntimeException(
                    "Quantity must be greater than zero");
        }

        if (updatedItem.getUnitPrice() == null ||
                updatedItem.getUnitPrice() < 0) {

            throw new RuntimeException(
                    "Unit price cannot be negative");
        }

        existingItem.setItemName(
                updatedItem.getItemName());

        existingItem.setQuantity(
                updatedItem.getQuantity());

        existingItem.setUnitPrice(
                updatedItem.getUnitPrice());

        double itemTotal =
                updatedItem.getQuantity()
                        * updatedItem.getUnitPrice();

        existingItem.setTotalPrice(itemTotal);

        OrderItem savedItem =
                orderItemRepository.save(existingItem);

        updateOrderTotal(order);

        return savedItem;
    }

    // DELETE ORDER ITEM
    public void deleteOrderItem(Long id) {

        OrderItem item =
                getOrderItemById(id);

        Order order = item.getOrder();

        orderItemRepository.delete(item);

        updateOrderTotal(order);
    }

    // RECALCULATE ORDER TOTAL
    private void updateOrderTotal(Order order) {

        List<OrderItem> items =
                orderItemRepository.findByOrderId(
                        order.getId());

        double total = 0.0;

        for (OrderItem item : items) {
            total += item.getTotalPrice();
        }

        order.setTotalAmount(total);

        orderRepository.save(order);
    }
}