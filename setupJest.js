/**
 * Code taken from this post
 * https://stackoverflow.com/questions/51133367/jest-testing-for-type-or-null
 */
expect.extend({
  nullOrAny(received, expected) {
    if (received === null) {
      return {
        pass: true,
        message: () => `expected null or instance of ${this.utils.printExpected(expected)}, but received ${this.utils.printReceived(received)}`
      };
    }

    if (expected == String) {
      return {
        pass: typeof received == 'string' || received instanceof String,
        message: () => `expected null or instance of ${this.utils.printExpected(expected)}, but received ${this.utils.printReceived(received)}`
      };
    }

    if (expected == Number) {
      return {
        pass: typeof received == 'number' || received instanceof Number,
        message: () => `expected null or instance of ${this.utils.printExpected(expected)}, but received ${this.utils.printReceived(received)}`
      };
    }
    
    return {
      pass: received instanceof expected,
      message: () => `expected null or instance of ${this.utils.printExpected(expected)}, but received ${this.utils.printReceived(received)}`
    };
  }
});