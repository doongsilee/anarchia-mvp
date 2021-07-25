// Function used to construct an emitter.
type Emitter<T, E extends Error> = (
  emit: (value: T | null, error: E | null) => void
) => () => void;

class EmitterBuffer<T, E extends Error> {
  private values: Array<T>;
  private error: E | null;
  private subscription: (() => void) | null;
  private promises: Array<{
    resolve: (value: Array<T>) => void;
    reject: (error: E) => void;
  }>;

  constructor(emitter: Emitter<T, E>) {
    this.values = [];
    this.error = null;
    this.promises = [];
    this.subscription = emitter((value, error) => {
      if (value != null) {
        this.resolve(value);
      }
      if (error != null) {
        this.reject(error);
      }
    });
  }

  resolve(value: T) {
    let resolvedAny = false;
    this.values.push(value);
    this.promises.forEach((promise) => {
      promise.resolve(this.values);
      resolvedAny = true;
    });
    if (resolvedAny) {
      this.values = [];
      this.promises = [];
    }
  }

  reject(error: E) {
    let rejectedAny = false;
    this.error = error;
    this.promises.forEach((promise) => {
      promise.reject(error);
      rejectedAny = true;
    });
    if (rejectedAny) {
      this.promises = [];
    }
  }

  fetchValues(): Array<T> {
    if (this.error != null) {
      throw this.error;
    }

    const values = this.values.splice(0, this.values.length);
    return values;
  }

  waitAndFetchValues(): Promise<Array<T>> {
    if (this.error != null) {
      return Promise.reject(this.error);
    }
    return new Promise((resolve, reject) => {
      this.promises.push({
        resolve,
        reject,
      });
    });
  }

  close() {
    if (this.subscription != null) {
      this.subscription();
      this.subscription = null;
    } else {
      throw new Error("EmitterBuffer already closed!");
    }
  }
}

export default EmitterBuffer;
