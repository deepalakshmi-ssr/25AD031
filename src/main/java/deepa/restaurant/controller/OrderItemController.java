package deepa.restaurant.controller;

import deepa.restaurant.entity.OrderItem;
import deepa.restaurant.service.OrderItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurant/order-items")
public class OrderItemController {

    private final OrderItemService orderItemService;

    public OrderItemController(OrderItemService orderItemService) {
        this.orderItemService = orderItemService;
    }

    // CREATE ORDER ITEM
    @PostMapping("/order/{orderId}")
    public ResponseEntity<OrderItem> createOrderItem(
            @PathVariable Long orderId,
            @RequestBody OrderItem orderItem) {

        return ResponseEntity.ok(
                orderItemService.createOrderItem(
                        orderId,
                        orderItem
                )
        );
    }

    // GET ALL ORDER ITEMS
    @GetMapping
    public ResponseEntity<List<OrderItem>> getAllOrderItems() {

        return ResponseEntity.ok(
                orderItemService.getAllOrderItems()
        );
    }

    // GET ITEMS BY ORDER
    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<OrderItem>> getItemsByOrderId(
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                orderItemService.getItemsByOrderId(orderId)
        );
    }

    // GET ORDER ITEM BY ID
    @GetMapping("/{id}")
    public ResponseEntity<OrderItem> getOrderItemById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                orderItemService.getOrderItemById(id)
        );
    }

    // UPDATE ORDER ITEM
    @PutMapping("/{id}")
    public ResponseEntity<OrderItem> updateOrderItem(
            @PathVariable Long id,
            @RequestBody OrderItem orderItem) {

        return ResponseEntity.ok(
                orderItemService.updateOrderItem(
                        id,
                        orderItem
                )
        );
    }

    // DELETE ORDER ITEM
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrderItem(
            @PathVariable Long id) {

        orderItemService.deleteOrderItem(id);

        return ResponseEntity.noContent().build();
    }
}