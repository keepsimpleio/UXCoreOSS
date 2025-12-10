// @ts-ignore
import geoip from 'geoip-lite';

// @ts-ignore
export default function handler(req, res) {
  const ip = req.headers['x-forwarded-for'];
  const geo = geoip.lookup(ip) || {};

  res.status(200).json({ ...geo, ip });
}
