import React, { useRef, useState } from 'react'
import Text from '../text/Text'

const ImageInput = ({
    label = null,
    width = "100%",
    height = "12em",
    bg = 'var(--trans-grey)',
    border = "2px dashed var(--border)",
    round = "8px",
    onchange = (file) => {},
    disabled = false,
    css = "",
    ...rest
}) => {
    const inputRef = useRef(null)
    const [preview, setPreview] = useState(null)
    const [isDragOver, setIsDragOver] = useState(false)

    const handleFileSelect = (file) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = (e) => {
                setPreview(e.target.result)
                onchange(file)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleInputChange = (e) => {
        const file = e.target.files?.[0]
        if (file) handleFileSelect(file)
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragOver(true)
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragOver(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragOver(false)
        const file = e.dataTransfer.files?.[0]
        if (file) handleFileSelect(file)
    }

    const handleRemove = (e) => {
        e.stopPropagation()
        setPreview(null)
        if (inputRef.current) inputRef.current.value = ''
        onchange(null)
    }

    return (
        <div className={`${css} flex column`} style={{ width }}>
            {label && (
                <label style={{ margin: "0.5em 0" }}>
                    <Text
                        text={label}
                        color='var(--text-low)'
                        size='var(--text-m)'
                        opacity='0.8'
                        align='left'
                    />
                </label>
            )}
            <div
                {...rest}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !disabled && !preview && inputRef.current?.click()}
                style={{
                    position: 'relative',
                    width: '100%',
                    height,
                    border,
                    borderRadius: round,
                    backgroundColor: bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: disabled || preview ? 'default' : 'pointer',
                    transition: 'all 0.2s ease',
                    borderColor: isDragOver ? 'var(--color-main)' : 'var(--border)',
                    opacity: disabled ? 0.5 : 1,
                }}
                className={isDragOver ? 'dragging' : ''}
            >
                {preview ? (
                    <div
                        style={{
                            position: 'relative',
                            width: '100%',
                            height: '100%',
                            borderRadius: round,
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <img
                            src={preview}
                            alt="preview"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                            }}
                        />
                        {!disabled && (
                            <button
                                onClick={handleRemove}
                                style={{
                                    position: 'absolute',
                                    top: '8px',
                                    right: '8px',
                                    background: 'rgba(0,0,0,0.6)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: 'white',
                                    fontSize: '1.2em',
                                    transition: 'background 0.2s',
                                }}
                                onMouseEnter={(e) => e.target.style.background = 'rgba(0,0,0,0.8)'}
                                onMouseLeave={(e) => e.target.style.background = 'rgba(0,0,0,0.6)'}
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        )}
                    </div>
                ) : (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75em',
                            textAlign: 'center',
                            pointerEvents: 'none',
                        }}
                    >
                        <i
                            className="fa-regular fa-image"
                            style={{
                                fontSize: '3em',
                                color: 'var(--text-low)',
                                opacity: 0.5,
                            }}
                        ></i>
                        <Text
                            text={isDragOver ? 'Drop image here' : 'Click or drag to upload'}
                            color='var(--text-low)'
                            size='var(--text-m)'
                            opacity={isDragOver ? 1 : 0.6}
                        />
                    </div>
                )}
            </div>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                disabled={disabled}
                style={{ display: 'none' }}
            />
        </div>
    )
}

export default ImageInput