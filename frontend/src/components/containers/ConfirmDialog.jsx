import React from 'react'
import Text from '../text/Text'
import PrimaryButton from '../buttons/PrimaryButton'
import SecondaryButton from '../buttons/SecondaryButton'
import Popup from './Popup'

const ConfirmDialog = ({
    isOpen = false,
    type = 'normal',
    title = 'Confirm',
    message = 'Are you sure?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm = () => {},
    onCancel = () => {},
}) => {
    const isDanger = type === 'danger'
    
    const iconMap = {
        normal: 'fa-solid fa-question-circle',
        danger: 'fa-solid fa-exclamation-triangle'
    }

    const colorMap = {
        normal: 'var(--color-main)',
        danger: 'rgb(255, 81, 0)'
    }

    return (
        <Popup isOpen={isOpen} blur={1.5} bg='rgba(0,0,0,0.3)' onClose={onCancel} zIndex={10001}>
            <div style={{
                backgroundColor: 'var(--bgc)',
                borderRadius: '0.8em',
                padding: '2em',
                maxWidth: '400px',
                textAlign: 'center',
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                position: 'relative',
                zIndex: 10001
            }}>
                <div style={{
                    fontSize: '2.5em',
                    marginBottom: '1em',
                    color: colorMap[type]
                }}>
                    <i className={iconMap[type]}></i>
                </div>

                <Text
                    text={title}
                    size='var(--text-l)'
                    w='600'
                    color='var(--text)'
                    align='center'
                    mrg='0 0 0.75em 0'
                />

                <Text
                    text={message}
                    size='var(--text-m)'
                    color='var(--text-low)'
                    align='center'
                    opacity='0.8'
                    mrg='0 0 1.5em 0'
                />

                <div style={{
                    display: 'flex',
                    gap: '0.75em',
                    justifyContent: 'center'
                }}>
                    <SecondaryButton
                        text={cancelText}
                        onClick={onCancel}
                    />
                    {isDanger ? (
                        <button
                            onClick={onConfirm}
                            style={{
                                padding: '0.6em 1.5em',
                                background: 'rgb(255, 81, 0)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5em',
                                cursor: 'pointer',
                                fontSize: 'var(--text-m)',
                                fontWeight: 'bold',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'rgb(255, 65, 0)'}
                            onMouseLeave={(e) => e.target.style.background = 'rgb(255, 81, 0)'}
                        >
                            {confirmText}
                        </button>
                    ) : (
                        <PrimaryButton
                            text={confirmText}
                            onClick={onConfirm}
                        />
                    )}
                </div>
            </div>
        </Popup>
    )
}

export default ConfirmDialog
