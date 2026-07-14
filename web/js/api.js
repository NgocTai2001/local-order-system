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

  function initials(value) {
    return String(value || '')
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'PV';
  }

  function applyRestaurantInfo(info, pageLabel) {
    const name = info?.name || 'Pho Viet';
    const mark = initials(name);
    const logo = String(info?.logo_image || '').trim();

    document.querySelectorAll('[data-restaurant-name]').forEach((element) => {
      element.textContent = name;
    });

    document.querySelectorAll('[data-restaurant-mark]').forEach((element) => {
      element.replaceChildren();
      if (logo) {
        const image = document.createElement('img');
        image.src = logo;
        image.alt = name;
        image.loading = 'lazy';
        image.onerror = () => {
          element.textContent = mark;
        };
        element.append(image);
      } else {
        element.textContent = mark;
      }
    });

    if (pageLabel) {
      document.title = `${name} - ${pageLabel}`;
    }
  }

  window.orderApi = {
    applyRestaurantInfo,
    formatCurrency,
    getRestaurantInfo() {
      return request('/api/restaurant');
    },
    updateRestaurantInfo(payload) {
      return request('/api/admin/restaurant', {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });
    },
    getMenu(includeUnavailable) {
      return request(`/api/menu${includeUnavailable ? '?all=1' : ''}`);
    },
    getMenuCategories(includeHidden) {
      return request(`/api/menu/categories${includeHidden ? '?all=1' : ''}`);
    },
    createMenuCategory(payload) {
      return request('/api/menu/categories', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },
    updateMenuCategory(id, payload) {
      return request(`/api/menu/categories/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });
    },
    deleteMenuCategory(id) {
      return request(`/api/menu/categories/${id}`, {
        method: 'DELETE'
      });
    },
    getOptionGroups() {
      return request('/api/admin/option-groups');
    },
    createOptionGroup(payload) {
      return request('/api/admin/option-groups', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },
    updateOptionGroup(id, payload) {
      return request(`/api/admin/option-groups/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
    },
    deleteOptionGroup(id) {
      return request(`/api/admin/option-groups/${id}`, {
        method: 'DELETE'
      });
    },
    updateMenuItemOptions(id, payload) {
      return request(`/api/admin/menu/${id}/options`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
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
    uploadMenuImage(payload) {
      return request('/api/uploads/menu-image', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },
    uploadRestaurantImage(payload) {
      return request('/api/uploads/restaurant-image', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },
    getOrders(status) {
      return request(`/api/orders${status ? `?status=${encodeURIComponent(status)}` : ''}`);
    },
    getKitchenOrders() {
      return request('/api/orders?kitchen=1');
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
    getStatistics(type = 'day', date = '') {
      const params = new URLSearchParams({ type });
      if (date) {
        params.set('date', date);
      }
      return request(`/api/statistics?${params.toString()}`);
    },
    getAreas() {
      return request('/api/areas');
    },
    createArea(payload) {
      return request('/api/areas', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },
    updateArea(id, payload) {
      return request(`/api/areas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
    },
    deleteArea(id) {
      return request(`/api/areas/${id}`, {
        method: 'DELETE'
      });
    },
    getTables(areaId) {
      return request(`/api/tables${areaId ? `?area_id=${encodeURIComponent(areaId)}` : ''}`);
    },
    getTableByToken(token) {
      return request(`/api/tables/token/${encodeURIComponent(token)}`);
    },
    getCurrentSession(tableId) {
      return request(`/api/tables/${tableId}/current-session`);
    },
    getCurrentBill(tableId) {
      return request(`/api/tables/${tableId}/current-bill`);
    },
    closeTableSession(tableId) {
      return request(`/api/tables/${tableId}/close-session`, {
        method: 'PATCH'
      });
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
    updateTablePositions(positions) {
      return request('/api/tables/positions', {
        method: 'PATCH',
        body: JSON.stringify({ positions })
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
