# Security Spec

1. Data Invariants:
   - Anyone can read products.
   - Only authenticated admins can write products, orders, and settings.
   - Anyone can create an order.
   - Only authenticated admins can update or read all orders (a user could read their own, but since we don't have user accounts yet, we will just allow creation for anonymous, and restrict reading to admins).

2. Dirty Dozen:
   - (1) Anonymous tries to delete a product -> DENY
   - (2) Anonymous tries to update a product -> DENY
   - (3) Anonymous tries to read orders -> DENY
   - (4) Anonymous tries to update an order -> DENY
   - (5) Admin updates product price to a string -> DENY
   - (6) Anonymous creates an order without a status -> DENY
   - (7) Admin tries to set order status to an invalid state -> DENY
   - (8) Admin creates a product with massive string size -> DENY
   ...

