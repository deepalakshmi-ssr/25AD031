package deepa.restaurant.controller;

import deepa.restaurant.entity.Bill;
import deepa.restaurant.service.BillService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurant/bills")
public class BillController {

    private final BillService billService;

    public BillController(BillService billService) {
        this.billService = billService;
    }

    @PostMapping("/order/{orderId}")
    public ResponseEntity<Bill> createBill(
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                billService.createBill(orderId)
        );
    }

    @GetMapping
    public ResponseEntity<List<Bill>> getAllBills() {

        return ResponseEntity.ok(
                billService.getAllBills()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Bill> getBillById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                billService.getBillById(id)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Bill> updateBill(
            @PathVariable Long id,
            @RequestBody Bill bill) {

        return ResponseEntity.ok(
                billService.updateBill(id, bill)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBill(
            @PathVariable Long id) {

        billService.deleteBill(id);

        return ResponseEntity.noContent().build();
    }
}