// Generic middleware factory that validates req.body / req.params / req.query
// against a given Zod schema shaped like { body, params, query }
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};

module.exports = validate;
