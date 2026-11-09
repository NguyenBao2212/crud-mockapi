import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const API_URL = 'https://671891927fc4c5ff8f49fcac.mockapi.io/v2';
const PAGE_SIZE = 10;

const initialForm = {
  name: '',
  avatar: '',
  address: '',
  genre: '',
  desc: '',
  color: '#6366f1',
  email: '',
  phone: '',
  timezone: '',
  building: '',
  music: '',
  password: '',
  city: '',
  country: '',
  street: '',
  state: '',
  zipcode: '',
  company: '',
  dob: '',
  fincode: '',
  ip: '',
  job: '',
  jd: '',
  typeofjob: ''
};

const formFields = Object.keys(initialForm);

function compareUsers(first, second, sortBy) {
  if (sortBy === 'name') {
    return String(first.name || '').localeCompare(String(second.name || ''));
  }

  if (sortBy === 'createdAt') {
    return new Date(first.createdAt || 0) - new Date(second.createdAt || 0);
  }

  return Number(first.id) - Number(second.id);
}

export default function Crud() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const currentPageRef = useRef(0);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);

  const fetchUsers = useCallback(async (page = 1, append = false) => {
    if (loadingRef.current || (append && !hasMoreRef.current)) {
      return;
    }

    loadingRef.current = true;
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}?page=${page}&limit=${PAGE_SIZE}`);
      if (!response.ok) {
        throw new Error('Không thể lấy danh sách user');
      }

      const data = await response.json();
      setUsers((previous) => append ? [...previous, ...data] : data);
      hasMoreRef.current = data.length === PAGE_SIZE;
      currentPageRef.current = page;
      if (!append) {
        setSelectedId(null);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadUsers = async () => {
      await fetchUsers();
    };

    loadUsers();
  }, [fetchUsers]);

  const handleTableScroll = (event) => {
    const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 40;

    if (isNearBottom) {
      fetchUsers(currentPageRef.current + 1, true);
    }
  };

  const resetForm = () => {
    setFormData(initialForm);
    setSelectedId(null);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSelect = (user) => {
    setSelectedId(user.id);
    setFormData({ ...initialForm, ...user });
  };

  const saveUser = async (method, id, action) => {
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên user');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(id ? `${API_URL}/${id}` : API_URL, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`Không thể ${action} user`);
      }

      const savedUser = await response.json();
      setUsers((previous) =>
        id
          ? previous.map((user) =>
              String(user.id) === String(id) ? savedUser : user
            )
          : [...previous, savedUser]
      );
      resetForm();
    } catch (requestError) {
      setError(requestError.message);
      alert(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => saveUser('POST', null, 'thêm');

  const handleEdit = () => {
    if (!selectedId) {
      alert('Chọn một user trước khi bấm Sửa!');
      return;
    }

    saveUser('PUT', selectedId, 'cập nhật');
  };

  const handleDelete = async () => {
    if (!selectedId) {
      alert('Chọn một user trước khi bấm Xóa!');
      return;
    }

    if (!window.confirm('Bạn có chắc muốn xóa user này không?')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/${selectedId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Không thể xóa user');
      }

      setUsers((previous) =>
        previous.filter((user) => String(user.id) !== String(selectedId))
      );
      resetForm();
    } catch (requestError) {
      setError(requestError.message);
      alert(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const visibleUsers = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    const filtered = users.filter((user) =>
      String(user.name || '').toLowerCase().includes(keyword)
    );
    const direction = sortOrder === 'asc' ? 1 : -1;

    return [...filtered].sort(
      (first, second) => direction * compareUsers(first, second, sortBy)
    );
  }, [searchTerm, sortBy, sortOrder, users]);

  return (
    <main className="crud-container">
      <h1>DANH SÁCH USER</h1>

      <form className="user-form" onSubmit={(event) => event.preventDefault()}>
        {formFields.map((field) => (
          <label key={field}>
            {field}:
            <input
              name={field}
              value={formData[field] || ''}
              onChange={handleInputChange}
              type={field === 'color' ? 'color' : 'text'}
              placeholder={`Nhập ${field}`}
            />
          </label>
        ))}
      </form>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Tìm kiếm theo name"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <label>
          Sắp xếp:
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="id">Theo ID</option>
            <option value="name">Theo Name</option>
            <option value="createdAt">Theo CreatedAt</option>
          </select>
        </label>
        <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
          <option value="asc">Tăng dần</option>
          <option value="desc">Giảm dần</option>
        </select>
      </div>

      <div className="toolbar">
        <button type="button" onClick={handleAdd}>Thêm</button>
        <button type="button" onClick={handleDelete}>Xóa</button>
        <button type="button" onClick={handleEdit}>Sửa</button>
        <button type="button" onClick={resetForm}>Xóa trắng form</button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      <p>Đã nạp: <strong>{users.length}</strong> users</p>

      <div className="table-wrapper" onScroll={handleTableScroll}>
        <table>
          <thead>
            <tr>
              <th>Select</th>
              <th>id</th>
              <th>createdAt</th>
              {formFields.map((field) => <th key={field}>{field}</th>)}
            </tr>
          </thead>
          <tbody>
            {visibleUsers.map((user) => (
              <tr key={user.id} style={{ backgroundColor: user.color || '#ffffff' }}>
                <td>
                  <input
                    type="radio"
                    name="selectedUser"
                    checked={String(selectedId) === String(user.id)}
                    onChange={() => handleSelect(user)}
                  />
                </td>
                <td>{user.id}</td>
                <td>{user.createdAt ? new Date(user.createdAt).toLocaleString('vi-VN') : ''}</td>
                {formFields.map((field) => (
                  <td key={field}>
                    {field === 'avatar' && user[field] ? (
                      <img className="avatar" src={user[field]} alt="avatar" />
                    ) : (
                      user[field]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
