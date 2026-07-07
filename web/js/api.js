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
      return request(`/api/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
    },
    getTables() {
      return request('/api/tables');
    },
    getTableByToken(token) {
      return request(`/api/tables/token/${encodeURIComponent(token)}`);
    },
    createTable(payload) {
      return request('/api/tables', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },
    createTablesBulk(payload) {
      return request('/api/tables/bulk', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },
    updateTable(id, payload) {
      return request(`/api/tables/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
    },
    deleteTable(id) {
      return request(`/api/tables/${id}`, {
        method: 'DELETE'
      });
    },
    regenerateTableToken(id) {
      return request(`/api/tables/${id}/regenerate-token`, {
        method: 'POST'
      });
    },
    getTableQr(id) {
      return request(`/api/tables/${id}/qr`);
    },
    getAllTableQr() {
      return request('/api/tables/qr/all');
    }
  };
})();
