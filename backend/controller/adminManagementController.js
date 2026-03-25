import { AuditLog } from "../models/auditLogSchema.js";
import { Complaint } from "../models/complaintSchema.js";

// Get all audit logs
export const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, action, entity, search } = req.query;
    
    const query = {};
    
    if (action) query.action = action;
    if (entity) query.entity = entity;
    if (search) {
      query.$or = [
        { userName: new RegExp(search, 'i') },
        { userEmail: new RegExp(search, 'i') },
        { details: new RegExp(search, 'i') }
      ];
    }

    const logs = await AuditLog.find(query)
      .populate('performedBy', 'name email role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await AuditLog.countDocuments(query);

    return res.status(200).json({
      success: true,
      logs,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error("Get audit logs error:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to fetch audit logs" 
    });
  }
};

// Get single audit log
export const getAuditLog = async (req, res) => {
  try {
    const log = await AuditLog.findById(req.params.id)
      .populate('performedBy', 'name email role');
    
    if (!log) {
      return res.status(404).json({ success: false, message: "Log not found" });
    }

    return res.status(200).json({ success: true, log });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Create audit log (for internal use)
export const createAuditLog = async (req, res) => {
  try {
    const { 
      action, 
      entity, 
      entityId, 
      details, 
      changes,
      ipAddress,
      userAgent 
    } = req.body;

    const user = req.user;
    
    const log = await AuditLog.create({
      action,
      entity,
      entityId,
      performedBy: user._id,
      userEmail: user.email,
      userName: user.name,
      details,
      changes,
      ipAddress,
      userAgent
    });

    return res.status(201).json({ success: true, log });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get all complaints
export const getComplaints = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, category, priority, search } = req.query;
    
    const query = {};
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { userName: new RegExp(search, 'i') },
        { subject: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    const complaints = await Complaint.find(query)
      .populate('userId', 'name email phone')
      .populate('resolution.resolvedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Complaint.countDocuments(query);

    return res.status(200).json({
      success: true,
      complaints,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error("Get complaints error:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to fetch complaints" 
    });
  }
};

// Get single complaint
export const getComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('adminNotes.addedBy', 'name email')
      .populate('resolution.resolvedBy', 'name email');
    
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    return res.status(200).json({ success: true, complaint });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Add admin note to complaint
export const addAdminNote = async (req, res) => {
  try {
    const { note } = req.body;
    const adminId = req.user._id;

    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    complaint.adminNotes.push({
      note,
      addedBy: adminId
    });

    await complaint.save();

    // Log this action
    await AuditLog.create({
      action: 'update',
      entity: 'Complaint',
      entityId: complaint._id,
      performedBy: adminId,
      userEmail: req.user.email,
      userName: req.user.name,
      details: `Added admin note to complaint #${complaint._id.toString().slice(-8)}`
    });

    return res.status(200).json({ success: true, complaint });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update complaint status
export const updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const adminId = req.user._id;

    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    const oldStatus = complaint.status;
    complaint.status = status;

    await complaint.save();

    // Log this action
    await AuditLog.create({
      action: 'update',
      entity: 'Complaint',
      entityId: complaint._id,
      performedBy: adminId,
      userEmail: req.user.email,
      userName: req.user.name,
      details: `Changed complaint status from ${oldStatus} to ${status}`
    });

    return res.status(200).json({ success: true, complaint });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Resolve complaint
export const resolveComplaint = async (req, res) => {
  try {
    const { resolutionText } = req.body;
    const adminId = req.user._id;

    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    complaint.status = 'resolved';
    complaint.resolution = {
      resolvedBy: adminId,
      resolvedAt: new Date(),
      resolutionText
    };

    await complaint.save();

    // Log this action
    await AuditLog.create({
      action: 'resolve_complaint',
      entity: 'Complaint',
      entityId: complaint._id,
      performedBy: adminId,
      userEmail: req.user.email,
      userName: req.user.name,
      details: `Resolved complaint #${complaint._id.toString().slice(-8)}: ${resolutionText}`
    });

    return res.status(200).json({ success: true, complaint });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete complaint
export const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    // Log this action
    await AuditLog.create({
      action: 'delete',
      entity: 'Complaint',
      entityId: req.params.id,
      performedBy: req.user._id,
      userEmail: req.user.email,
      userName: req.user.name,
      details: `Deleted complaint #${req.params.id.toString().slice(-8)}`
    });

    return res.status(200).json({ success: true, message: "Complaint deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
