import { useEffect, useState } from 'react';

const API_URL = 'https://671891927fc4c5ff8f49fcac.mockapi.io/v2';
// Dữ liệu mặc định ban đầu cho một cái FORM
const initialForm = {
  name: '',
  email: '',
  avatar: '',
  phone: '',
  address: '',
  genre: '',
  desc: '',
  color: '#6366f1',
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

export default function Crud() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); //state lưu lại từ khóa đang tìm 
  const [loading, setLoading] = useState(false); //state có lấy được dữ liệu từ api k
  const [error, setError] = useState(''); // Set lỗi khi mà ko lấy được dữ liệu từ api về

  //Cái này là để lấy user từ api nè
  const fetchUsers = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(API_URL); //Đợi lấy dữ liệu từ api về

      if (!response.ok) {
        throw new Error('Không thể lấy danh sách user'); //Trả lỗi 
      }

      const data = await response.json(); 
      setUsers(data); //Cập nhật lại state của user từ api 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  //Load uer của api sau khi render lần đầu 
  useEffect(() => {
    const loadUsers = async () => {
      await fetchUsers();
    };

    loadUsers();
  }, []);
  //Quản lý dữ liệu khi người dùng đang nhập vào form
  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous, //Dùng cái này để không bị mất mấy cái field  còn lại trong cái form 
      [name]: value
    }));
  };
  //set cái form về mặc định ban đầu và set cái editingId về null để biết là đang thêm user mới chứ k phải sửa user cũ
  const resetForm = () => {
    setFormData(initialForm);
    setEditingId(null);
  };
  
  //Thêm user
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên user'); //Kiểm tra nếu chưa nhập thì báo lỗi -> Dừng hàm 
      return;
    }

    setLoading(true);

    try {
      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      const method = editingId ? 'PUT' : 'POST'; //Nếu đúng thì PUt cập nhật, sai thì tạo mới 

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(
          editingId
            ? 'Không thể cập nhật user'
            : 'Không thể thêm user'
        );
      }

      const savedUser = await response.json();

      if (editingId) {
        setUsers((previous) =>
          previous.map((user) => //Tạo cái mảng mới với mỗi user, rồi so cái user mới nó là user nào trong mảng cũ, nếu là user mới thì thêm vô 
            String(user.id) === String(editingId)
              ? savedUser
              : user 
          )
        );
      } else {
        setUsers((previous) => [
          ...previous, //Giữ danh sách cũ
          savedUser
        ]);
      }

      resetForm();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.id);

    setFormData({
      ...initialForm,
      ...user
    });

  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Bạn có chắc muốn xóa user này không?'
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, { //Lấy id của user cần xóa từ api
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Không thể xóa user');
      }

      setUsers((previous) =>
        previous.filter(
          (user) => String(user.id) !== String(id)
        )
      );

      if (String(editingId) === String(id)) {
        resetForm();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleClearAll = () => {
    const confirmed = window.confirm(
      'Bạn có chắc muốn xóa trắng danh sách không?'
    );

    if (!confirmed) return;

    setUsers([]); //Xóa trắng ở cái state giao diện thôi chưa có xóa trong mockapi
    resetForm();
  };

  const filteredUsers = users.filter((user) => {
    const keyword = searchTerm.toLowerCase();

    return [
      user.name,
      user.email,
      user.phone,
      user.city,
      user.country,
      user.company
    ]
      .filter(Boolean)
      .some((value) =>
        String(value).toLowerCase().includes(keyword)
      );
  });

  return (
    <main className="crud-container">
      <h1>DANH SÁCH USER</h1>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Tìm kiếm user..."
          value={searchTerm}
          onChange={(event) =>
            setSearchTerm(event.target.value)
          }
        />

        <button type="button" onClick={fetchUsers}>
          Tải lại
        </button>

        <button type="button" onClick={handleClearAll}>
          Xóa trắng
        </button>
      </div>

      {loading && <p>Đang xử lý...</p>}
      {error && <p className="error">{error}</p>}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Avatar</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Genre</th>
              <th>City</th>
              <th>Country</th>
              <th>Company</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                style={{
                  backgroundColor: user.color || '#ffffff'
                }}
              >
                <td>{user.id}</td>

                <td>
                  <img
                    className="avatar"
                    src={user.avatar}
                    alt={user.name}
                  />
                </td>

                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>{user.address}</td>
                <td>{user.genre}</td>
                <td>{user.city}</td>
                <td>{user.country}</td>
                <td>{user.company}</td>

                <td>
                  <button
                    type="button"
                    onClick={() => handleEdit(user)}
                  >
                    Sửa
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(user.id)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form className="user-form" onSubmit={handleSubmit}>
        <h2>
          {editingId ? 'SỬA USER' : 'THÊM USER'}
        </h2>

        {formFields.map((field) => (
          <label key={field}>
            {field}

            <input
              name={field}
              value={formData[field] || ''}
              onChange={handleInputChange}
              type={field === 'color' ? 'color' : 'text'}
              placeholder={`${field}`}
            />
          </label>
        ))}

        <div className="form-buttons">
          <button type="submit">
            {editingId ? 'Cập nhật' : 'Thêm'}
          </button>

          <button type="button" onClick={resetForm}>
            Làm mới
          </button>
        </div>
      </form>
    </main>
  );
}