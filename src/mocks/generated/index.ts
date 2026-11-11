// GENERADO por scripts/gen-mocks.ts desde ../accounts_api/openapi.yaml. No editar a mano.
export const examples = {
  "register": {
    "409": {
      "example": {
        "code": "EMAIL_ALREADY_REGISTERED",
        "message": "Email already registered"
      }
    }
  },
  "login": {
    "401": {
      "example": {
        "code": "INVALID_CREDENTIALS",
        "message": "Invalid email or password"
      }
    },
    "429": {
      "example": {
        "code": "TOO_MANY_REQUESTS",
        "message": "Too many login attempts"
      }
    }
  },
  "logout": {
    "401": {
      "unauthorized": {
        "code": "UNAUTHORIZED",
        "message": "Missing or invalid token"
      },
      "invalidRefreshToken": {
        "code": "INVALID_REFRESH_TOKEN",
        "message": "Invalid refresh token"
      }
    }
  },
  "recharge": {
    "201": {
      "schema": {
        "id": "a41e5c1d-0b2a-4f3e-9d8c-7b6a5f4e3d21",
        "accountId": "6f1c4e2a-8b1d-4c3e-9f7a-2d5b8c1e0a34",
        "movementType": "recharge",
        "amount": 150000,
        "details": {
          "rechargeType": "salary"
        },
        "createdAt": "2026-11-09T14:30:00.000Z"
      }
    },
    "422": {
      "cashLimit": {
        "code": "CASH_LIMIT_EXCEEDED",
        "message": "Cash recharge limit exceeded"
      },
      "dailyCount": {
        "code": "DAILY_RECHARGE_COUNT_EXCEEDED",
        "message": "Daily recharge count exceeded"
      },
      "dailyAmount": {
        "code": "DAILY_RECHARGE_AMOUNT_EXCEEDED",
        "message": "Daily recharge amount exceeded"
      },
      "balanceLimit": {
        "code": "BALANCE_LIMIT_EXCEEDED",
        "message": "Balance limit exceeded"
      },
      "keyReused": {
        "code": "IDEMPOTENCY_KEY_REUSED",
        "message": "Idempotency key already used with a different request"
      }
    }
  },
  "transfer": {
    "201": {
      "schema": {
        "transferOut": {
          "id": "c7a01b2c-3d4e-4f5a-8b6c-7d8e9f0a1b2c",
          "accountId": "6f1c4e2a-8b1d-4c3e-9f7a-2d5b8c1e0a34",
          "movementType": "transfer_out",
          "amount": 40000,
          "details": {
            "relatedAccountId": "b92d7e6f-5a4b-4c3d-8e2f-1a0b9c8d7e6f"
          },
          "createdAt": "2026-11-09T14:35:00.000Z"
        },
        "transferIn": {
          "id": "d8131a2b-3c4d-4e5f-9a6b-7c8d9e0f1a2b",
          "accountId": "b92d7e6f-5a4b-4c3d-8e2f-1a0b9c8d7e6f",
          "movementType": "transfer_in",
          "amount": 40000,
          "details": {
            "relatedAccountId": "6f1c4e2a-8b1d-4c3e-9f7a-2d5b8c1e0a34"
          },
          "createdAt": "2026-11-09T14:35:00.000Z"
        }
      }
    },
    "422": {
      "insufficientFunds": {
        "code": "INSUFFICIENT_FUNDS",
        "message": "Insufficient funds"
      },
      "balanceLimit": {
        "code": "BALANCE_LIMIT_EXCEEDED",
        "message": "Balance limit exceeded"
      },
      "keyReused": {
        "code": "IDEMPOTENCY_KEY_REUSED",
        "message": "Idempotency key already used with a different request"
      }
    }
  }
} as const

// Respuestas compartidas por varias operaciones: examples de BadRequest, Unauthorized, etc.
export const sharedExamples = {
  "BadRequest": {
    "invalidRequestBody": {
      "code": "BAD_REQUEST",
      "message": "Invalid request body"
    },
    "invalidName": {
      "code": "BAD_REQUEST",
      "message": "Invalid name"
    },
    "invalidEmail": {
      "code": "BAD_REQUEST",
      "message": "Invalid email"
    },
    "passwordTooShort": {
      "code": "BAD_REQUEST",
      "message": "Password too short"
    },
    "passwordTooLong": {
      "code": "BAD_REQUEST",
      "message": "Password too long"
    },
    "invalidAccountType": {
      "code": "BAD_REQUEST",
      "message": "Invalid account type"
    },
    "invalidAccountId": {
      "code": "BAD_REQUEST",
      "message": "Invalid account id"
    },
    "invalidAccountNumber": {
      "code": "BAD_REQUEST",
      "message": "Invalid account number"
    },
    "invalidRechargeType": {
      "code": "BAD_REQUEST",
      "message": "Invalid recharge type"
    },
    "invalidAmount": {
      "code": "BAD_REQUEST",
      "message": "Amount must be greater than zero"
    },
    "amountTooLarge": {
      "code": "BAD_REQUEST",
      "message": "Amount exceeds maximum"
    },
    "sameAccount": {
      "code": "BAD_REQUEST",
      "message": "Cannot transfer to the same account"
    },
    "invalidPagination": {
      "code": "BAD_REQUEST",
      "message": "Invalid pagination"
    },
    "invalidIdempotencyKey": {
      "code": "BAD_REQUEST",
      "message": "Invalid idempotency key"
    }
  },
  "InternalError": {
    "example": {
      "code": "INTERNAL_ERROR",
      "message": "Internal error"
    }
  },
  "InvalidRefreshToken": {
    "example": {
      "code": "INVALID_REFRESH_TOKEN",
      "message": "Invalid refresh token"
    }
  },
  "Unauthorized": {
    "example": {
      "code": "UNAUTHORIZED",
      "message": "Missing or invalid token"
    }
  },
  "Forbidden": {
    "example": {
      "code": "FORBIDDEN",
      "message": "Access denied"
    }
  },
  "AccountNotFound": {
    "example": {
      "code": "NOT_FOUND",
      "message": "Account not found"
    }
  },
  "IdempotencyInProgress": {
    "example": {
      "code": "IDEMPOTENCY_REQUEST_IN_PROGRESS",
      "message": "Request with this idempotency key is in progress"
    }
  }
} as const
