import express from 'express';
import { checkReturnEligibility } from '../services/eligibilityService.js';
import { generateReturnCode, getPackingInstructions, SIMULATION_SHIPPING_ADDRESS } from '../services/returnService.js';

const router = express.Router();

// 1. Check Return Eligibility Endpoint
router.post('/returns/check', (req, res) => {
  const { orderNumber, sealAvailable, daysRange, reason } = req.body || {};

  if (!orderNumber || typeof orderNumber !== 'string' || orderNumber.trim().length === 0) {
    return res.status(400).json({
      error: true,
      message: 'Nomor pesanan (orderNumber) wajib diisi.'
    });
  }

  if (typeof sealAvailable !== 'boolean') {
    return res.status(400).json({
      error: true,
      message: 'Ketersediaan segel (sealAvailable) harus berupa boolean (true/false).'
    });
  }

  const result = checkReturnEligibility({
    orderNumber: orderNumber.trim(),
    sealAvailable,
    daysRange,
    reason
  });

  if (!result.valid) {
    return res.status(400).json({
      error: true,
      message: result.error
    });
  }

  return res.status(200).json(result.data);
});

// 2. Create Return Submission Endpoint (Generate Return Code & Packing Instructions)
router.post('/returns/create', (req, res) => {
  const { orderNumber, eligibilityResult, resolution, category } = req.body || {};

  if (!orderNumber || typeof orderNumber !== 'string' || orderNumber.trim().length === 0) {
    return res.status(400).json({
      error: true,
      message: 'Nomor pesanan (orderNumber) wajib diisi.'
    });
  }

  if (!eligibilityResult || typeof eligibilityResult !== 'object' || eligibilityResult.eligible !== true) {
    return res.status(400).json({
      error: true,
      message: 'Pengajuan yang tidak layak retur tidak dapat membuat kode retur.'
    });
  }

  const validResolutions = ['exchange', 'refund', 'size_swap'];
  if (!resolution || !validResolutions.includes(resolution)) {
    return res.status(400).json({
      error: true,
      message: 'Jenis penyelesaian (resolution) tidak valid. Pilihan valid: "exchange", "refund", "size_swap".'
    });
  }

  const validCategories = ['fashion', 'electronics', 'accessories', 'home_appliances', 'other'];
  if (!category || !validCategories.includes(category)) {
    return res.status(400).json({
      error: true,
      message: 'Kategori barang (category) tidak valid. Pilihan valid: "fashion", "electronics", "accessories", "home_appliances", "other".'
    });
  }

  const returnCode = generateReturnCode();
  const createdAt = new Date().toISOString();
  const packingInstructions = getPackingInstructions(category);

  return res.status(200).json({
    returnCode,
    orderNumber: orderNumber.trim(),
    createdAt,
    status: 'Pengajuan dibuat',
    resolution,
    category,
    packingInstructions,
    shippingAddress: SIMULATION_SHIPPING_ADDRESS
  });
});

export default router;
