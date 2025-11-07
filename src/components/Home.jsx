import DynamicFormIcon from '@mui/icons-material/DynamicForm';
import { v7 as uuidV7 } from 'uuid';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');
    const navigate = useNavigate();
    
    const handleRoomIdClick = (e) => {
        e.preventDefault();
        const id = uuidV7();
        setRoomId(id);
        toast.success('Created a new room');
        console.log(id);
    }
    
    const handleJoinBtn = (e) => {
        e.preventDefault();
        if (!roomId) {
            toast.error("Room Id is required");
            return;
        }
        
        if (!username) {
            toast.error("Username is required");
            return;
        }
        
        
        navigate(`/editor/${roomId}`, {
            state: {username}
        })
    }
    
    const handleKeyDownInput = (e) => {
        if (e.code === 'ENTER') {
            handleJoinBtn();
        }
    }
    
    return (
        <div className='main-container'>
            <div className='formWrapper'>
                <div className='headerWrapper'>
                    <div className='iconClass'><DynamicFormIcon fontSize='large' /></div>
                    <div className='headerWrapper-right'>
                        <h1>Code Sync</h1>
                        <p>Realtime collaboration</p>
                    </div>
                </div>
                
                <h4 className='text-description'>Paste invitation Room Id</h4>
                <div className='formBody'>
                    <input type='text' name='roomId' id='roomId' placeholder='ROOM ID' value={roomId} onChange={(e)=>setRoomId(e.target.value)} onKeyUp={handleKeyDownInput}/>
                    <input type='text' name='username' id='username' placeholder='USERNAME' value={username} onChange={(e)=>setUsername(e.target.value)} onKeyUp={handleKeyDownInput}/>
                    <div className='submitBtn-container'>
                        <button type='submit' className='submitBtn' onClick={handleJoinBtn}>Join</button>
                    </div>
                </div>
                
                <p className='inviteDescription'>If you don't have an invite then create&nbsp;<a href='/' onClick={ handleRoomIdClick }>new room</a></p>
                </div>
        </div>
    )
}

export default Home;