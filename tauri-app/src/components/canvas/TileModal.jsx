import React, { useState, useEffect } from 'react';
import actionConfig from './actionConfig.json';
import saveCanvas from '../../utils/canvas/saveCanvas';

const TileModal = ({ 
    position,
    screenPosition,
    onClose,
    selectedTileInfo,
    getAppsList,
    onActionSave,
    currentAction,
    canvasId,
    layers,
    allActions 
}) => {
    const [actions, setActions] = useState([]);
    const [dynamicOptions, setDynamicOptions] = useState({ apps: [] });

    useEffect(() => {
        if (currentAction) {
            const initialActions = Array.isArray(currentAction) 
                ? currentAction.map(action => ({
                    id: Date.now() + Math.random(),
                    ...action
                }))
                : [{
                    id: Date.now(),
                    action: currentAction.action,
                    option: currentAction.option,
                    fields: currentAction.fields || {}
                }];
            setActions(initialActions);
        } else {
            setActions([]);
        }
    }, [currentAction]);

    useEffect(() => {
        const loadApps = async () => {
            const apps = await getAppsList();
            console.log('Loaded apps:', apps);
            setDynamicOptions(prev => ({
                ...prev,
                apps: apps
            }));
        };
        loadApps();
    }, [getAppsList]);

    const handleAddAction = () => {
        setActions(prev => [...prev, {
            id: Date.now(),
            action: '',
            option: '',
            fields: {}
        }]);
    };

    const handleRemoveAction = (actionId) => {
        setActions(prev => prev.filter(a => a.id !== actionId));
    };

    const updateAction = (actionId, field, value) => {
        setActions(prev => prev.map(a => {
            if (a.id === actionId) {
                if (field === 'action') {
                    return { ...a, action: value, option: '', fields: {} };
                } else if (field === 'option') {
                    return { ...a, option: value, fields: {} };
                } else {
                    return { ...a, [field]: value };
                }
            }
            return a;
        }));
    };

    const updateField = (actionId, fieldName, value) => {
        setActions(prev => prev.map(a => {
            if (a.id === actionId) {
                return {
                    ...a,
                    fields: { ...a.fields, [fieldName]: value }
                };
            }
            return a;
        }));
    };

    const handleSave = async () => {
        const tileKey = `${position.x}-${position.y}`;
        const validActions = actions.filter(a => 
            a.action && a.option && Object.keys(a.fields).length > 0
        );

        const actionData = validActions.map(({ action, option, fields }) => ({
            action,
            option,
            fields,
            position
        }));
        console.log('Saving actions:', actionData);
        
        try {
            onActionSave(tileKey, actionData);
            onClose();
        } catch (error) {
            console.error('Failed to save actions:', error);
        }
    };

    const handleCopyActions = () => {
        try {
            localStorage.setItem('copiedTileActions', JSON.stringify(actions));
        } catch (error) {
            console.error('Failed to copy actions:', error);
        }
    };

    const handlePasteActions = () => {
        try {
            const savedActions = localStorage.getItem('copiedTileActions');
            if (savedActions) {
                const parsedActions = JSON.parse(savedActions);
                const pastedActions = parsedActions.map(action => ({
                    ...action,
                    id: Date.now() + Math.random()
                }));
                setActions(pastedActions);
            }
        } catch (error) {
            console.error('Failed to paste actions:', error);
        }
    };

    const renderField = (field, actionItem) => {
        if (field.type === 'multiselect') {
            const selectedValues = actionItem.fields[field.name] || [];
            return (
                <div key={field.name}>
                    <label className="label">
                        <span className="label-text">{field.label}</span>
                    </label>
                    <div className="flex flex-col gap-2">
                        {field.options.map(opt => (
                            <label key={opt.value} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-sm"
                                    checked={selectedValues.includes(opt.value)}
                                    onChange={(e) => {
                                        const newValues = e.target.checked
                                            ? [...selectedValues, opt.value]
                                            : selectedValues.filter(v => v !== opt.value);
                                        updateField(actionItem.id, field.name, newValues);
                                    }}
                                />
                                <span>{opt.label}</span>
                            </label>
                        ))}
                    </div>
                </div>  
            );
        }

        if (field.type === 'select') {
            return (
                <div key={field.name}>
                    <label className="label">
                        <span className="label-text">{field.label}</span>
                    </label>
                    <select 
                        className="select select-bordered w-full"
                        value={actionItem.fields[field.name] || ''}
                        onChange={(e) => updateField(actionItem.id, field.name, e.target.value)}
                    >
                        <option value="">Select {field.label}</option>
                        {(field.dynamicOptions ? dynamicOptions[field.dynamicOptions] : field.options)?.map(opt => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            );
        }

        return (
            <div key={field.name}>
                <label className="label">
                    <span className="label-text">{field.label}</span>
                </label>
                <input 
                    type="text"
                    className="input input-bordered w-full"
                    value={actionItem.fields[field.name] || ''}
                    onChange={(e) => updateField(actionItem.id, field.name, e.target.value)}
                />
            </div>
        );
    };

    return (
        <div className="fixed modal-content bg-base-100 rounded-lg shadow-xl border border-base-300 max-h-92 overflow-auto"
            style={{
                left: `${screenPosition.x + 20}px`,
                top: `${screenPosition.y}px`,
                maxWidth: '300px',
                minWidth: '250px',
                zIndex: 1000
            }}
            onClick={e => e.stopPropagation()}>
            <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Tile {position.x}, {position.y}</h3>
                    <button className="btn btn-sm btn-ghost" onClick={onClose}>✕</button>
                </div>

                <div className="flex gap-2 mb-4">
                    <button 
                        className="btn btn-sm btn-outline flex-1"
                        onClick={handleCopyActions}
                        disabled={actions.length === 0}
                    >
                        Copy Actions
                    </button>
                    <button 
                        className="btn btn-sm btn-outline flex-1"
                        onClick={handlePasteActions}
                        disabled={!localStorage.getItem('copiedTileActions')}
                    >
                        Paste Actions
                    </button>
                </div>

                <div className="space-y-4">
                    {actions.map((actionItem, index) => (
                        <details key={actionItem.id} className="collapse collapse-arrow bg-base-200">
                            <summary className="collapse-title text-sm font-medium">
                                {actionItem.action ? actionConfig.actions[actionItem.action].label : `Action ${index + 1}`}
                            </summary>
                            <div className="collapse-content space-y-2">
                                <select 
                                    className="select select-bordered w-full"
                                    value={actionItem.action}
                                    onChange={(e) => updateAction(actionItem.id, 'action', e.target.value)}
                                >
                                    <option value="">Select Action</option>
                                    {Object.entries(actionConfig.actions).map(([key, value]) => (
                                        <option key={key} value={key}>{value.label}</option>
                                    ))}
                                </select>

                                {actionItem.action && (
                                    <select 
                                        className="select select-bordered w-full"
                                        value={actionItem.option}
                                        onChange={(e) => updateAction(actionItem.id, 'option', e.target.value)}
                                    >
                                        <option value="">Select Option</option>
                                        {Object.entries(actionConfig.actions[actionItem.action].options).map(([key, value]) => (
                                            <option key={key} value={key}>{value.label}</option>
                                        ))}
                                    </select>
                                )}

                                {actionItem.action && actionItem.option && (
                                    <div className="space-y-2">
                                        {actionConfig.actions[actionItem.action].options[actionItem.option].fields.map(field => 
                                            renderField(field, actionItem)
                                        )}
                                    </div>
                                )}

                                <button 
                                    className="btn btn-error btn-sm w-full"
                                    onClick={() => handleRemoveAction(actionItem.id)}
                                >Remove Action</button>
                            </div>
                        </details>
                    ))}
                </div>

                <div className="flex flex-col gap-2 mt-4">
                    <button 
                        className="btn btn-secondary w-full"
                        onClick={handleAddAction}
                    >
                        Add Action
                    </button>
                    
                    <button 
                        className="btn btn-primary w-full"
                        onClick={handleSave}
                    >Save All Actions</button>
                </div>
            </div>
        </div>
    );
};

export default TileModal;
