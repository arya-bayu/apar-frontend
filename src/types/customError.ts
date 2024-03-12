interface CustomError extends Error {
  response: {
    data: {
      code: number
      status: string
      data: string | null
      errors: string[] | null
    }
  }
}
