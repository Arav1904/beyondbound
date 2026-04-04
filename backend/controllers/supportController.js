import SupportTicket from "../models/SupportTicket.js";

const generateTicketNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(100000 + Math.random() * 900000);
  return `SUP-${year}${month}${day}-${random}`;
};

const createUniqueTicketNumber = async () => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const ticketNumber = generateTicketNumber();
    const exists = await SupportTicket.exists({ ticketNumber });
    if (!exists) {
      return ticketNumber;
    }
  }

  throw new Error("Could not generate unique ticket number");
};

export const submitSupportTicket = async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const subject = String(req.body?.subject || "").trim();
    const message = String(req.body?.message || "").trim();
    const phone = String(req.body?.phone || "").trim();

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: "Name, email, subject, and message are required",
      });
    }

    const ticket = await SupportTicket.create({
      ticketNumber: await createUniqueTicketNumber(),
      userId: req.userId || null,
      name,
      email,
      phone,
      subject,
      message,
      source: "website",
      status: "open",
      priority: "medium",
    });

    return res.status(201).json({
      success: true,
      message: "Support ticket submitted successfully",
      data: {
        id: ticket._id,
        ticketNumber: ticket.ticketNumber,
        status: ticket.status,
        createdAt: ticket.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to submit support ticket",
      message: error.message,
    });
  }
};
