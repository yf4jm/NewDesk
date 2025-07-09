import React, { useState, useEffect } from 'react';
import actionConfig from './actionConfig.json';
import getApps from '../../utils/getApps';
import saveCanvas from '../../utils/canvas/saveCanvas';

const DesktopCanvasSidebar = ({ 
    showSidebar, 
    setShowSidebar, 
    selectedTileInfo, 
    getAppsList,
    onActionSave,
    currentAction,
    canvasId,
    layers,
    allActions
}) => {
    const layerNames = ['Bottom', 'Middle', 'Top'];
    const [action, setAction] = useState('');
    const [selectedOption, setSelectedOption] = useState('');
    const [fieldValues, setFieldValues] = useState({});
    const [dynamicOptions, setDynamicOptions] = useState({
        apps: []
    });
    const [isLoading, setIsLoading] = useState(true);

    const handleFieldChange = (fieldName, value) => {
        setFieldValues(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    useEffect(() => {
        const loadDynamicOptions = async () => {
            setIsLoading(true);
            try {
                const appsList = await getAppsList();
                if (Array.isArray(appsList)) {
                    setDynamicOptions(prev => ({
                        ...prev,
                        apps: appsList.map(app => ({
                            value: app.id,
                            label: app.name
                        }))
                    }));
                }
            } catch (error) {
                console.error('Failed to load apps:', error);
                setDynamicOptions(prev => ({
                    ...prev,
                    apps: []
                }));
            } finally {
                setIsLoading(false);
            }
        };

        loadDynamicOptions();
    }, [getAppsList]);

    // Reset form when opening sidebar for a new tile
    useEffect(() => {
        if (currentAction) {
            setAction(currentAction.action);
            setSelectedOption(currentAction.option);
            setFieldValues(currentAction.fields || {});
        } else {
            setAction('');
            setSelectedOption('');
            setFieldValues({});
        }
    }, [currentAction, selectedTileInfo.position]);

    const handleSaveAction = async () => {
        if (!action || !selectedOption || !Object.keys(fieldValues).length) {
            return;
        }

        const tileKey = `${selectedTileInfo.position.x}-${selectedTileInfo.position.y}`;
        const actionData = {
            action,
            option: selectedOption,
            fields: fieldValues,
            position: selectedTileInfo.position
        };
        
        // First update parent state
        onActionSave(tileKey, actionData);

        // Then save to backend
        try {
            const updatedActions = {
                ...allActions,
                [tileKey]: actionData
            };
            await saveCanvas(canvasId, layers, updatedActions);
            setShowSidebar(false);
        } catch (error) {
            console.error('Failed to save action:', error);
        }
    };

    const handleRemoveAction = async () => {
        const tileKey = `${selectedTileInfo.position.x}-${selectedTileInfo.position.y}`;
        
        // First update parent state
        onActionSave(tileKey, null);

        // Then save to backend
        try {
            const updatedActions = { ...allActions };
            delete updatedActions[tileKey];
            await saveCanvas(canvasId, layers, updatedActions);
            setShowSidebar(false);
        } catch (error) {
            console.error('Failed to remove action:', error);
        }
    };

    const renderField = (field) => {
        switch (field.type) {
            case 'select':
                return (
                    <div key={field.name} className="form-control w-full mt-4">
                        <label className="label">
                            <span className="label-text">{field.label}</span>
                        </label>
                        {isLoading && field.dynamicOptions ? (
                            <div className="loading loading-spinner"></div>
                        ) : (
                            <select 
                                className="select select-bordered w-full"
                                value={fieldValues[field.name] || ''}
                                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            >
                                <option value="">Select {field.label}</option>
                                {field.dynamicOptions ? 
                                    dynamicOptions[field.dynamicOptions]?.map(opt => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))
                                    :
                                    field.options?.map(opt => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))
                                }
                            </select>
                        )}
                    </div>
                );
            case 'text':
                return (
                    <div key={field.name} className="form-control w-full mt-4">
                        <label className="label">
                            <span className="label-text">{field.label}</span>
                        </label>
                        <input 
                            type="text"
                            className="input input-bordered w-full"
                            value={fieldValues[field.name] || ''}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="drawer drawer-end">
            <input 
                id="tile-drawer" 
                type="checkbox" 
                className="drawer-toggle" 
                checked={showSidebar} 
                readOnly 
            />
            <div className="drawer-side">
                <label 
                    htmlFor="tile-drawer" 
                    className="drawer-overlay" 
                    onClick={() => setShowSidebar(false)}
                ></label>
                <div className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">Tile Information</h3>
                        <button 
                            className="btn btn-square btn-sm"
                            onClick={() => setShowSidebar(false)}
                        >
                            ✕
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div className="stats shadow">
                            <div className="stat">
                                <div className="stat-title">Position</div>
                                <div className="stat-value text-lg">
                                    {selectedTileInfo.position.x}, {selectedTileInfo.position.y}
                                </div>
                            </div>
                        </div>
                        
                        {selectedTileInfo.tiles.length > 0 ? (
                            <div className="space-y-2">
                                <h4 className="font-bold">Tiles at this position:</h4>
                                {selectedTileInfo.tiles.map((tile, index) => (
                                    <div key={index} className="stats shadow">
                                        <div className="stat">
                                            <div className="stat-title">
                                                {layerNames[tile.layer]} Layer
                                            </div>
                                            <div className="stat-value text-lg">
                                                [{tile.data[0]}, {tile.data[1]}]
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="alert alert-info">
                                No tiles at this position
                            </div>
                        )}
                    </div>
                    
                    <select 
                        className="select select-bordered w-full mt-4"
                        value={action}
                        onChange={(e) => {
                            setAction(e.target.value);
                            setSelectedOption('');
                            setFieldValues({});
                        }}
                    >
                        <option value="">Select Action</option>
                        {Object.entries(actionConfig.actions).map(([key, value]) => (
                            <option key={key} value={key}>{value.label}</option>
                        ))}
                    </select>

                    {action && (
                        <select 
                            className="select select-bordered w-full mt-4"
                            value={selectedOption}
                            onChange={(e) => {
                                setSelectedOption(e.target.value);
                                setFieldValues({});
                            }}
                        >
                            <option value="">Select Option</option>
                            {Object.entries(actionConfig.actions[action].options).map(([key, value]) => (
                                <option key={key} value={key}>{value.label}</option>
                            ))}
                        </select>
                    )}

                    {action && selectedOption && actionConfig.actions[action].options[selectedOption].fields.map(field => 
                        renderField(field)
                    )}

                    {Object.keys(fieldValues).length > 0 && (
                        <div className="space-y-2 mt-4">
                            <button 
                                className="btn btn-primary w-full"
                                onClick={handleSaveAction}
                            >
                                {currentAction ? 'Update Action' : 'Save Action'}
                            </button>
                            
                            {currentAction && (
                                <button 
                                    className="btn btn-error w-full"
                                    onClick={handleRemoveAction}
                                >
                                    Remove Action
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DesktopCanvasSidebar;