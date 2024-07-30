export const validateSchema = (schema) => async(req, res, next) => {
  try {
    req.body = await schema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ error: error.errors });
  }
};
