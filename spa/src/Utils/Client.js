class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BadRequestError';
  }
}

class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

class Client {
  constructor() {
    this.defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    }
  }

  async get(url) {
    let response;
    let payload;

    try {
      response = await fetch(url, {
        ...this.defaultOptions,
        method: 'GET',
      });
      payload = await response.json();
    } catch (e) {
      console.error(e);
      throw e;
    }

    this.throwHttpErrors(response, payload);

    return { response, payload };
  }

  async patch(url, data) {
    let response;
    let payload;

    try {
      response = await fetch(url, {
        ...this.defaultOptions,
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      payload = await response.json();
    } catch (e) {
      console.error(e);
      throw e;
    }

    this.throwHttpErrors(response, payload);

    return { response, payload };
  }

  async post(url, data) {
    let response;
    let payload;

    try {
      response = await fetch(url, {
        method: 'POST',
        ...this.defaultOptions,
        body: JSON.stringify(data),
      });
      payload = await response.json();
    } catch (e) {
      console.error(e);
      throw e;
    }

    this.throwHttpErrors(response, payload);

    return { response, payload };
  }

  throwHttpErrors(response, payload) { // Should be a private method
    if (!response.ok) {
      console.error(response, payload);

      switch (response.status) {
        case 400:
          throw new BadRequestError('Status code is 400.');
        case 401:
          throw new UnauthorizedError('Status code is 401.');
        default:
          throw new Error('Status code does not match 2xx.');
      }
    }
  }
}

export default new Client();
