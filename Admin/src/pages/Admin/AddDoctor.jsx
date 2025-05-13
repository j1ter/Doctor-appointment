import React, { useContext, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../../assets/assets';

const AddDoctor = () => {
    const { backendUrl } = useContext(AdminContext);
    const [docImg, setDocImg] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [experience, setExperience] = useState('1 Year');
    const [fees, setFees] = useState('');
    const [speciality, setSpeciality] = useState('General Physician');
    const [degree, setDegree] = useState('');
    const [address1, setAddress1] = useState('');
    const [address2, setAddress2] = useState('');
    const [about, setAbout] = useState('');

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        try {
            if (!docImg) {
                return toast.error('Image not selected');
            }
// hello
            const formData = new FormData();
            formData.append('image', docImg);
            formData.append('name', name);
            formData.append('email', email);
            formData.append('password', password);
            formData.append('experience', experience);
            formData.append('fees', Number(fees));
            formData.append('speciality', speciality);
            formData.append('degree', degree);
            formData.append('address', JSON.stringify({ line1: address1, line2: address2 }));
            formData.append('about', about);

            console.log('FormData:', [...formData.entries()]);

            const { data } = await axios.post(`${backendUrl}/api/admin/add-doctor`, formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (data.success) {
                toast.success(data.message);
                setDocImg(false);
                setName('');
                setEmail('');
                setPassword('');
                setExperience('1 Year');
                setFees('');
                setSpeciality('General Physician');
                setDegree('');
                setAddress1('');
                setAddress2('');
                setAbout('');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error adding doctor:', error);
            toast.error(error.response?.data?.message || 'Error adding doctor');
        }
    };

    return (
        <form onSubmit={onSubmitHandler} className='m-5 w-full'>
            <p className='mb-3 text-lg font-medium text-gray-700'>Add Doctor</p>
            <div className='bg-white px-8 py-8 border rounded w-full max-w-4xl max-h-[80vh] overflow-y-auto'>
                <div className='flex items-center gap-3 mb-8'>
                    <label htmlFor='doc-img'>
                        <img
                            className='w-16 bg-gray-100 rounded-full cursor-pointer'
                            src={docImg ? URL.createObjectURL(docImg) : assets.upload_area}
                            alt=''
                        />
                    </label>
                    <input
                        onChange={(e) => setDocImg(e.target.files[0])}
                        type='file'
                        id='doc-img'
                        accept='image/*'
                        hidden
                    />
                    <p className='text-sm text-gray-500'>
                        Upload doctor picture <br /> (Max 1MB)
                    </p>
                </div>
                <div className='flex flex-col gap-4 text-gray-600'>
                    <div className='flex flex-col sm:flex-row items-start gap-3'>
                        <div className='w-full sm:w-1/2'>
                            <p>Doctor name</p>
                            <input
                                className='border rounded px-3 py-2 mt-1 w-full'
                                type='text'
                                onChange={(e) => setName(e.target.value)}
                                value={name}
                                required
                            />
                        </div>
                        <div className='w-full sm:w-1/2'>
                            <p>Doctor Email</p>
                            <input
                                className='border rounded px-3 py-2 mt-1 w-full'
                                type='email'
                                onChange={(e) => setEmail(e.target.value)}
                                value={email}
                                required
                            />
                        </div>
                    </div>
                    <div className='flex flex-col sm:flex-row items-start gap-3'>
                        <div className='w-full sm:w-1/2'>
                            <p>Doctor Password</p>
                            <input
                                className='border rounded px-3 py-2 mt-1 w-full'
                                type='password'
                                onChange={(e) => setPassword(e.target.value)}
                                value={password}
                                required
                            />
                        </div>
                        <div className='w-full sm:w-1/2'>
                            <p>Experience</p>
                            <select
                                onChange={(e) => setExperience(e.target.value)}
                                className='border rounded px-3 py-2 mt-1 w-full'
                                value={experience}
                            >
                                <option value='1 Year'>1 Year</option>
                                <option value='2 Years'>2 Years</option>
                                <option value='3 Years'>3 Years</option>
                                <option value='4 Years'>4 Years</option>
                                <option value='5 Years'>5 Years</option>
                                <option value='6 Years'>6 Years</option>
                                <option value='7 Years'>7 Years</option>
                                <option value='8 Years'>8 Years</option>
                                <option value='9 Years'>9 Years</option>
                                <option value='10 Years'>10 Years</option>
                            </select>
                        </div>
                    </div>
                    <div className='flex flex-col sm:flex-row items-start gap-3'>
                        <div className='w-full sm:w-1/2'>
                            <p>Fees</p>
                            <input
                                className='border rounded px-3 py-2 mt-1 w-full'
                                type='number'
                                onChange={(e) => setFees(e.target.value)}
                                value={fees}
                                required
                            />
                        </div>
                        <div className='w-full sm:w-1/2'>
                            <p>Speciality</p>
                            <select
                                onChange={(e) => setSpeciality(e.target.value)}
                                className='border rounded px-3 py-2 mt-1 w-full'
                                value={speciality}
                            >
                                <option value='General Physician'>General Physician</option>
                                <option value='Gynecologist'>Gynecologist</option>
                                <option value='Dermatologist'>Dermatologist</option>
                                <option value='Pediatricians'>Pediatricians</option>
                                <option value='Neurologist'>Neurologist</option>
                                <option value='Gastroenterologist'>Gastroenterologist</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <p>Education</p>
                        <input
                            className='border rounded px-3 py-2 mt-1 w-full'
                            type='text'
                            onChange={(e) => setDegree(e.target.value)}
                            value={degree}
                            required
                        />
                    </div>
                    <div>
                        <p>Address 1</p>
                        <input
                            className='border rounded px-3 py-2 mt-1 w-full'
                            type='text'
                            onChange={(e) => setAddress1(e.target.value)}
                            value={address1}
                            required
                        />
                    </div>
                    <div>
                        <p>Address 2</p>
                        <input
                            className='border rounded px-3 py-2 mt-1 w-full'
                            type='text'
                            onChange={(e) => setAddress2(e.target.value)}
                            value={address2}
                            required
                        />
                    </div>
                    <div>
                        <p>About Doctor</p>
                        <textarea
                            className='border rounded px-3 py-2 mt-1 w-full'
                            onChange={(e) => setAbout(e.target.value)}
                            value={about}
                            rows={4}
                            required
                        />
                    </div>
                    <button
                        type='submit'
                        className='bg-primary text-white px-10 py-2 rounded-full text-sm'
                    >
                        Add doctor
                    </button>
                </div>
            </div>
        </form>
    );
};

export default AddDoctor;