export default function logRequest(req, res, next) {
  console.log(`[RES] ${req.ip}`);
  next();
}
