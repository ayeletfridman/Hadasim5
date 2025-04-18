const SupplierModel = require("../models/Supplier");

// Render the supplier login page
const SupplierController = {
  showLoginPage: (req, res) => {
    res.render("supplier/login", { error: null });
  },

  // Handle supplier login
  login: async (req, res) => {
    const { companyName, phone } = req.body;

    try {
      const supplier = await SupplierModel.getSupplierByName(companyName);

      if (!supplier) {
        return res.render("supplier/login", {
          error: "חברה לא נמצאה, נסה שוב.",
        });
      }

      // If phone number matches, log in the supplier
      if (supplier.phone === phone) {
        return res.render("supplier/dashboard", {
          companyName: supplier.companyName,
          supplierId: supplier.id,
        });
      } else {
        return res.render("supplier/login", {
          error: "מספר טלפון שגוי, נסה שוב.",
        });
      }
    } catch (error) {
      console.error("שגיאה בהתחברות:", error);
      res.status(500).send("שגיאה בהתחברות");
    }
  },

  // View orders placed with the supplier
  viewOrders: async (req, res) => {
    const { supplierId, companyName } = req.query;

    try {
      const orders = await SupplierModel.getOrdersBySupplierId(supplierId); // Fetch orders for the supplier

      if (orders.length === 0) {
        return res.send("אין הזמנות לספק הזה.");
      }

      res.render("supplier/orders", { orders, companyName });
    } catch (error) {
      console.error("שגיאה בשליפת הזמנות:", error);
      res.status(500).send("שגיאה בשליפת הזמנות");
    }
  },

  // Approve the order and update its status
  approveOrder: async (req, res) => {
    const orderId = req.params.id;

    try {
      await SupplierModel.updateOrderStatus(orderId, "בתהליך"); // Update order status to "in process"
      res.json({ status: "בתהליך" });
    } catch (error) {
      console.error("שגיאה בעדכון סטטוס ההזמנה:", error);
      res.status(500).send("שגיאה בעדכון סטטוס ההזמנה");
    }
  },

  // Render the supplier registration page
  showRegisterPage: (req, res) => {
    res.render("supplier/register");
  },

  // Register a new supplier and their products
  registerSupplier: async (req, res) => {
    const { companyName, phone, representative } = req.body;
    const products = {
      productNames: req.body.productName || [],
      prices: req.body.price || [],
      minQuantities: req.body.minQuantity || [],
    };

    try {
      await SupplierModel.createSupplierWithProducts(
        companyName,
        phone,
        representative,
        products
      );
      res.redirect("/supplier/login"); // Redirect to login page
    } catch (error) {
      console.error("שגיאה בהרשמה:", error);
      res.status(500).send("שגיאה בהרשמה");
    }
  },
};

module.exports = SupplierController; // Export the SupplierController
