"use client";

import { useState } from "react";

export default function HelpTooltip({ text }: { text: string }) {
    const [show, setShow] = useState(false);

    return (
        <span style={{ position: 'relative', display: 'inline-block' }}>
            <span
                className="help-icon"
                onClick={(e) => {
                    e.stopPropagation();
                    setShow(!show);
                }}
            >
                ?
            </span>
            {show && (
                <div style={{
                    position: 'absolute',
                    bottom: '120%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#1e293b',
                    color: 'white',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    width: '240px',
                    zIndex: 1000,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                    lineHeight: '1.4',
                    fontWeight: 400
                }}>
                    {text}
                    {/* Arrow */}
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        marginLeft: '-6px',
                        borderWidth: '6px',
                        borderStyle: 'solid',
                        borderColor: '#1e293b transparent transparent transparent'
                    }} />
                </div>
            )}
        </span>
    );
}
