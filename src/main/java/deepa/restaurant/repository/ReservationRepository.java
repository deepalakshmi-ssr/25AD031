package deepa.restaurant.repository;

import deepa.restaurant.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface ReservationRepository
        extends JpaRepository<Reservation, Long> {

    List<Reservation> findByRestaurantTableIdAndReservationDateAndStartTimeLessThanAndEndTimeGreaterThan(
            Long tableId,
            LocalDate reservationDate,
            LocalTime requestedEndTime,
            LocalTime requestedStartTime
    );
}