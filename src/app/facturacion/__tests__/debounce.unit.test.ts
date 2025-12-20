/**
 * Unit tests for debouncing implementation
 * Tests the debounce mechanism in detail
 */

describe('Debounce Implementation - Unit Tests', () => {
  let debouncedValue: string = ''
  let callbackCallCount: number = 0
  let lastCallbackValue: string = ''
  let timerId: NodeJS.Timeout | null = null

  const createDebounce = (delay: number = 500) => {
    return (value: string, callback: (value: string) => void) => {
      if (timerId) {
        clearTimeout(timerId)
      }
      debouncedValue = value
      timerId = setTimeout(() => {
        callback(value)
        callbackCallCount++
        lastCallbackValue = value
      }, delay)
    }
  }

  beforeEach(() => {
    debouncedValue = ''
    callbackCallCount = 0
    lastCallbackValue = ''
    timerId = null
    jest.useFakeTimers()
  })

  afterEach(() => {
    if (timerId) {
      clearTimeout(timerId)
    }
    jest.useRealTimers()
  })

  describe('Basic Debounce Behavior', () => {
    test('debounce function stores value immediately', () => {
      const debounce = createDebounce(500)
      const callback = jest.fn()

      debounce('test', callback)
      expect(debouncedValue).toBe('test')
      expect(callback).not.toHaveBeenCalled()
    })

    test('debounce calls callback after delay', () => {
      const debounce = createDebounce(500)
      const callback = jest.fn()

      debounce('test', callback)
      jest.advanceTimersByTime(500)

      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith('test')
    })

    test('debounce does not call callback before delay', () => {
      const debounce = createDebounce(500)
      const callback = jest.fn()

      debounce('test', callback)
      jest.advanceTimersByTime(499)

      expect(callback).not.toHaveBeenCalled()
    })
  })

  describe('Timer Reset Behavior', () => {
    test('new value resets timer', () => {
      const debounce = createDebounce(500)
      const callback = jest.fn()

      debounce('a', callback)
      jest.advanceTimersByTime(300)
      debounce('ab', callback)
      jest.advanceTimersByTime(300)

      expect(callback).not.toHaveBeenCalled()

      jest.advanceTimersByTime(200) // Total 500ms from last call
      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith('ab')
    })

    test('multiple rapid calls only trigger one callback', () => {
      const debounce = createDebounce(500)
      const callback = jest.fn()

      debounce('a', callback)
      debounce('ab', callback)
      debounce('abc', callback)
      debounce('abcd', callback)

      jest.advanceTimersByTime(500)

      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith('abcd')
    })

    test('timer reset clears previous timer', () => {
      const debounce = createDebounce(500)
      const callback = jest.fn()

      debounce('first', callback)
      const firstTimer = timerId

      debounce('second', callback)
      const secondTimer = timerId

      expect(firstTimer).not.toBe(secondTimer)
      jest.advanceTimersByTime(500)

      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith('second')
    })
  })

  describe('Edge Cases', () => {
    test('debounce handles empty string', () => {
      const debounce = createDebounce(500)
      const callback = jest.fn()

      debounce('', callback)
      jest.advanceTimersByTime(500)

      expect(callback).toHaveBeenCalledWith('')
    })

    test('debounce handles special characters', () => {
      const debounce = createDebounce(500)
      const callback = jest.fn()

      debounce('test@#$%^&*()', callback)
      jest.advanceTimersByTime(500)

      expect(callback).toHaveBeenCalledWith('test@#$%^&*()')
    })

    test('debounce handles unicode characters', () => {
      const debounce = createDebounce(500)
      const callback = jest.fn()

      debounce('testñáéíóú', callback)
      jest.advanceTimersByTime(500)

      expect(callback).toHaveBeenCalledWith('testñáéíóú')
    })

    test('debounce handles very long strings', () => {
      const debounce = createDebounce(500)
      const callback = jest.fn()
      const longString = 'a'.repeat(1000)

      debounce(longString, callback)
      jest.advanceTimersByTime(500)

      expect(callback).toHaveBeenCalledWith(longString)
    })
  })

  describe('Multiple Debounce Instances', () => {
    test('multiple independent debounce instances work correctly', () => {
      // Create separate debounce functions with their own timers
      let timer1: NodeJS.Timeout | null = null
      let timer2: NodeJS.Timeout | null = null
      
      const debounce1 = (value: string, callback: (value: string) => void) => {
        if (timer1) clearTimeout(timer1)
        timer1 = setTimeout(() => callback(value), 500)
      }
      
      const debounce2 = (value: string, callback: (value: string) => void) => {
        if (timer2) clearTimeout(timer2)
        timer2 = setTimeout(() => callback(value), 300)
      }
      
      const callback1 = jest.fn()
      const callback2 = jest.fn()

      debounce1('value1', callback1)
      debounce2('value2', callback2)

      jest.advanceTimersByTime(300)
      expect(callback2).toHaveBeenCalledWith('value2')
      expect(callback1).not.toHaveBeenCalled()

      jest.advanceTimersByTime(200)
      expect(callback1).toHaveBeenCalledWith('value1')
    })
  })

  describe('Cleanup Behavior', () => {
    test('clearing timer prevents callback', () => {
      const debounce = createDebounce(500)
      const callback = jest.fn()

      debounce('test', callback)
      if (timerId) {
        clearTimeout(timerId)
        timerId = null
      }

      jest.advanceTimersByTime(500)
      expect(callback).not.toHaveBeenCalled()
    })

    test('new debounce call clears previous timer', () => {
      const debounce = createDebounce(500)
      const callback = jest.fn()

      debounce('first', callback)
      const firstCallTime = Date.now()

      // Immediately call again
      debounce('second', callback)

      jest.advanceTimersByTime(500)

      // Should only call once with second value
      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith('second')
    })
  })

  describe('Delay Variations', () => {
    test('works with different delay values', () => {
      const delays = [100, 300, 500, 1000]
      
      delays.forEach(delay => {
        const debounce = createDebounce(delay)
        const callback = jest.fn()
        
        debounce('test', callback)
        jest.advanceTimersByTime(delay - 1)
        expect(callback).not.toHaveBeenCalled()
        
        jest.advanceTimersByTime(1)
        expect(callback).toHaveBeenCalledTimes(1)
        
        jest.clearAllTimers()
        callback.mockClear()
      })
    })

    test('works with zero delay (immediate)', () => {
      const debounce = createDebounce(0)
      const callback = jest.fn()

      debounce('test', callback)
      jest.advanceTimersByTime(0)

      expect(callback).toHaveBeenCalledWith('test')
    })
  })

  describe('Real-world Scenarios', () => {
    test('simulates typing "factura" with realistic timing', () => {
      const debounce = createDebounce(500)
      const callback = jest.fn()

      // Simulate realistic typing speed (100ms between keystrokes)
      const chars = ['f', 'fa', 'fac', 'fact', 'factu', 'factur', 'factura']
      chars.forEach((char, index) => {
        debounce(char, callback)
        if (index < chars.length - 1) {
          jest.advanceTimersByTime(100)
        }
      })

      // Should not have called yet
      expect(callback).not.toHaveBeenCalled()

      // Wait for full delay after last keystroke
      jest.advanceTimersByTime(500)

      // Should only call once with final value
      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith('factura')
    })

    test('simulates user pausing and continuing typing', () => {
      const debounce = createDebounce(500)
      const callback = jest.fn()

      // Type first part
      debounce('test', callback)
      jest.advanceTimersByTime(300)

      // User pauses, then continues
      jest.advanceTimersByTime(500) // Past delay
      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith('test')

      // User continues typing
      callback.mockClear()
      debounce('test2', callback)
      jest.advanceTimersByTime(500)

      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith('test2')
    })

    test('simulates rapid backspace and retype', () => {
      const debounce = createDebounce(500)
      const callback = jest.fn()

      debounce('test', callback)
      jest.advanceTimersByTime(200)
      debounce('tes', callback) // Backspace
      jest.advanceTimersByTime(100)
      debounce('test', callback) // Retype
      jest.advanceTimersByTime(500)

      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith('test')
    })
  })
})

