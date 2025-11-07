import Avatar from 'react-avatar';

const Client = ({username}) => {
    return (
        <div className='editor-left-profile'>
            <Avatar name={username} size="50" round={ '14px' } />
            <span className='editor-username'>{ username }</span>
        </div>
    )
}

export default Client;