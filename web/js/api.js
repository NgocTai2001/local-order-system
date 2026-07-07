(function () {
  async function request(path, options) {
    const response = await fetch(path, {
      headers: {
        'Content-Type': 'application/json'
      },
      ...options
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value);
  }

  window.orderApi = {
    formatCurrency,
    getMenu(includeUnavailable) {
      return request(`/api/menu${includeUnavailable ? '?all=1' : ''}`);
    },
    createMenuItem(payload) {
      return request('/api/menu', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },
    updateMenuItem(id, payload) {
      return request(`/api/menu/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });
    },
    deleteMenuItem(id) {
      return request(`/api/menu/${id}`, {
        method: 'DELETE'
      });
    },
    getOrders(status) {
      return request(`/api/orders${status ? `?status=${encodeURIComponent(status)}` : ''}`);
    },
    createOrder(payload) {
      return request('/api/orders', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },
    updateOrder(id, status) {
      return request(`/api/orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
    }
  };
})();
