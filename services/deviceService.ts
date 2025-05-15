// services/deviceService.ts
import apiClient from './apiClient';

// --- Interfaces based on GraphQL response and Database Schema ---

export interface Equipment {
    id: number;
    categoryId: number;
    homeId: number;
    areaId?: number | null; 
    title: string;
    description?: string | null;
    timeStart?: string | null;
    timeEnd?: string | null;
    turnOn: boolean; 
    cycle?: number | null;
    status?: 'active' | 'inactive' | 'maintenance' | string;
}

export interface Area {
    id: number;
    homeId: number;
    name: string;
    equipment?: Equipment[] | null;
}

export interface Home {
    id: number;
    accountId?: number | null;
    homeName: string;
    location?: string | null;
    deleted?: boolean;
    createdAt?: string;
    area?: Area[];
}

// --- Generic GraphQL Response Structures ---
interface GraphQLQueryResponse<T> {
    data?: T | null;
    errors?: Array<{ message: string; path?: string[]; [key: string]: any }>; 
}
interface GraphQLMutationResponse<T> {
    data?: T | null; 
    errors?: Array<{ message: string; path?: string[]; [key: string]: any }>; 
}

// --- Specific Response Types for Deletes ---
export interface DeleteResponsePayload {
    code: number;
    msg: string;
}

// --- Input Types for Mutations ---
export interface HomeInput {
    id?: number;
    homeName?: string;
    location?: string;
}

// Interface for data passed from UI to service functions for Area
export interface AreaServiceInput { 
    id?: number;     // Required for update/delete
    homeId?: number; // Required for create, potentially for update context
    name?: string;   // Required for create/update
}

// Input type for the $input variable in CreateArea GraphQL mutation
interface GQLCreateAreaVariableInput {
    homeId: string; 
    name: string;
}

// Input type for the $area variable in EditArea GraphQL mutation
// Assuming server's AreaInput for edit requires id, and potentially name and homeId
interface GQLEditAreaVariableInput {
    id: number;
    name?: string;
    homeId?: string; // Assuming backend might want this as string for consistency
}


export interface EquipmentInputForService { 
    id?: number;
    categoryId?: number; 
    homeId?: number;     
    areaId?: number | null; 
    title?: string;      
    description?: string | null;
    timeStart?: string | null;
    timeEnd?: string | null;
    cycle?: number | null;
    status?: 'active' | 'inactive' | 'maintenance' | string;
}

export interface DeviceInput {
    id: number;
    turnOn: boolean; 
}


// --- Service methods ---

export const deviceService = {
    getHomeScreenData: async (): Promise<Home | null> => {
        const graphqlQuery = {
            query: `
                query GetHome {
                    getHome {
                        id
                        accountId
                        homeName
                        location
                        deleted
                        createdAt
                        area {
                            id
                            homeId
                            name
                            equipment {
                                id
                                categoryId
                                homeId
                                areaId
                                title
                                description
                                timeStart
                                timeEnd
                                turnOn 
                                cycle
                                status
                            }
                        }
                    }
                }
            `,
        };
        try {
            console.log("[deviceService] Attempting to fetch home data via GraphQL...");
            const response = await apiClient.post<GraphQLQueryResponse<{ getHome: Home[] }>>('/query', graphqlQuery);
            if (response.data?.errors) {
                throw new Error(response.data.errors.map(e => `Path: ${e.path?.join('.')} - Message: ${e.message}`).join('; '));
            }
            if (response.data?.data?.getHome && response.data.data.getHome.length > 0) {
                const firstHome = response.data.data.getHome[0];
                console.log("[deviceService] Fetched home data successfully:", firstHome);
                return firstHome;
            } else {
                console.warn("[deviceService] No home data received or getHome array is empty.");
                return null;
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            console.error("[deviceService] Error fetching home data via GraphQL:", message);
            throw new Error(message);
        }
    },

    // --- HOME CRUD ---
    createHome: async (input: Omit<HomeInput, 'id'>): Promise<Home> => {
        const mutation = {
            query: ` 
                mutation CreateHome($home: HomeInput!) {
                    createHome(home: $home) {
                        id
                        accountId
                        homeName
                        location
                        deleted
                        createdAt
                    }
                }
            `,
            variables: { home: input } 
        };
        try {
            console.log("[deviceService] Creating home with variables:", JSON.stringify(mutation.variables, null, 2));
            const response = await apiClient.post<GraphQLMutationResponse<{ createHome: Home }>>('/query', mutation);
            if (response.data?.errors) throw new Error(response.data.errors.map(e => `Path: ${e.path?.join('.')} - Message: ${e.message}`).join('; '));
            if (!response.data?.data?.createHome) throw new Error("Failed to create home or no data returned.");
            console.log("[deviceService] Home created successfully:", response.data.data.createHome);
            return response.data.data.createHome;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            console.error("[deviceService] Error creating home:", message);
            throw new Error(message);
        }
    },

    updateHome: async (input: HomeInput): Promise<Home> => {
        if (!input.id) throw new Error("Home ID is required for update.");
        const mutation = {
            query: `
                mutation EditHome($home: HomeInput!) {
                    editHome(home: $home) {
                        id
                        accountId
                        homeName
                        location
                        deleted
                        createdAt
                    }
                }
            `,
            variables: { home: input } 
        };
        try {
            console.log("[deviceService] Updating home with variables:", JSON.stringify(mutation.variables, null, 2));
            const response = await apiClient.post<GraphQLMutationResponse<{ editHome: Home }>>('/query', mutation);
            if (response.data?.errors) throw new Error(response.data.errors.map(e => `Path: ${e.path?.join('.')} - Message: ${e.message}`).join('; '));
            if (!response.data?.data?.editHome) throw new Error("Failed to update home or no data returned.");
            console.log("[deviceService] Home updated successfully:", response.data.data.editHome);
            return response.data.data.editHome;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            console.error("[deviceService] Error updating home:", message);
            throw new Error(message);
        }
    },

    deleteHome: async (homeId: number): Promise<DeleteResponsePayload> => {
        const mutation = {
            query: `
                mutation DeleteHome($home: HomeInput!) { 
                    deleteHome(home: $home) {
                        code
                        msg
                    }
                }
            `,
            variables: { home: { id: homeId } } 
        };
        try {
            console.log("[deviceService] Deleting home with ID:", homeId, "using variables:", JSON.stringify(mutation.variables, null, 2));
            const response = await apiClient.post<GraphQLMutationResponse<{ deleteHome: DeleteResponsePayload }>>('/query', mutation);
            if (response.data?.errors) throw new Error(response.data.errors.map(e => `Path: ${e.path?.join('.')} - Message: ${e.message}`).join('; '));
            if (!response.data?.data?.deleteHome) throw new Error("Failed to delete home or no confirmation returned.");
            console.log("[deviceService] Home deleted confirmation:", response.data.data.deleteHome);
            return response.data.data.deleteHome;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            console.error("[deviceService] Error deleting home:", message);
            throw new Error(message);
        }
    },

    // --- AREA CRUD ---
    createArea: async (areaDetails: Omit<AreaServiceInput, 'id'>): Promise<Area> => {
        if (areaDetails.homeId === undefined || !areaDetails.name) {
            throw new Error("homeId and name are required for creating an area.");
        }

        const gqlVariableInput: GQLCreateAreaVariableInput = {
            homeId: String(areaDetails.homeId), // Backend expects string for homeId in CreateArea's $input
            name: areaDetails.name,
        };

        const mutation = {
            query: `
                mutation CreateArea($input: CreateArea!) { 
                    createArea(area: $input) {        
                        id
                        homeId
                        name
                    }
                }
            `,
            variables: { 
                input: gqlVariableInput // This $input is of type CreateArea! on server
            }
        };
        try {
            console.log("[deviceService] Creating area with variables:", JSON.stringify(mutation.variables, null, 2));
            const response = await apiClient.post<GraphQLMutationResponse<{ createArea: Area }>>('/query', mutation);
            if (response.data?.errors) throw new Error(response.data.errors.map(e => `Path: ${e.path?.join('.')} - Message: ${e.message}`).join('; '));
            if (!response.data?.data?.createArea) throw new Error("Failed to create area or no data returned.");
            console.log("[deviceService] Area created successfully:", response.data.data.createArea);
            return response.data.data.createArea;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            console.error("[deviceService] Error creating area:", message);
            throw new Error(message);
        }
    },

    updateArea: async (input: AreaServiceInput): Promise<Area> => {
        if (!input.id) {
            throw new Error("Area ID is required for update.");
        }
        if (!input.name) { // Assuming name is always required for an update if provided
            throw new Error("Area name is required for update.");
        }

        // Construct the payload for the $area variable of type AreaInput!
        // Based on your EDIT_AREA gql constant.
        const gqlVariableInput: GQLEditAreaVariableInput = {
            id: input.id,
            name: input.name,
        };
        // If homeId is also part of the server's AreaInput for EditArea and needs to be sent:
        if (input.homeId !== undefined) {
           gqlVariableInput.homeId = String(input.homeId); // Send as string, consistent with createArea
        }


        const mutation = {
            query: `
                mutation EditArea($area: AreaInput!) {
                    editArea(area: $area) {
                        id
                        homeId
                        name
                    }
                }
            `,
            variables: { area: gqlVariableInput } // $area variable expects type AreaInput!
        };
        try {
            console.log("[deviceService] Updating area with variables:", JSON.stringify(mutation.variables, null, 2));
            const response = await apiClient.post<GraphQLMutationResponse<{ editArea: Area }>>('/query', mutation);
            if (response.data?.errors) throw new Error(response.data.errors.map(e => `Path: ${e.path?.join('.')} - Message: ${e.message}`).join('; '));
            if (!response.data?.data?.editArea) throw new Error("Failed to update area or no data returned.");
            console.log("[deviceService] Area updated successfully:", response.data.data.editArea);
            return response.data.data.editArea;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            console.error("[deviceService] Error updating area:", message);
            throw new Error(message);
        }
    },

    deleteArea: async (areaId: number): Promise<DeleteResponsePayload> => {
        const mutation = {
            query: `
                mutation DeleteArea {
                    deleteArea(area: { id: ${areaId} }) {
                        code
                        msg
                    }
                }
            `,
            variables: {} 
        };
        try {
            console.log(`[deviceService] Deleting area with ID: ${areaId} (ID inlined in query)`);
            const response = await apiClient.post<GraphQLMutationResponse<{ deleteArea: DeleteResponsePayload }>>('/query', mutation);
            if (response.data?.errors) throw new Error(response.data.errors.map(e => `Path: ${e.path?.join('.')} - Message: ${e.message}`).join('; '));
            if (!response.data?.data?.deleteArea) throw new Error("Failed to delete area or no confirmation returned.");
            console.log("[deviceService] Area deleted confirmation:", response.data.data.deleteArea);
            return response.data.data.deleteArea;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            console.error("[deviceService] Error deleting area:", message);
            throw new Error(message);
        }
    },

    // --- EQUIPMENT CRUD ---
    createEquipment: async (inputFromUI: Omit<EquipmentInputForService, 'id'>): Promise<Equipment> => {
        const equipmentPayloadForGQL: any = { 
            categoryId: Number(inputFromUI.categoryId),
            homeId: Number(inputFromUI.homeId),
            title: inputFromUI.title,
            description: inputFromUI.description || null, 
            status: inputFromUI.status || 'active',
        };

        if (inputFromUI.areaId !== undefined && inputFromUI.areaId !== null) {
            equipmentPayloadForGQL.AreaId = Number(inputFromUI.areaId); 
        } else {
            equipmentPayloadForGQL.AreaId = null; 
        }
        
        if (inputFromUI.timeStart) equipmentPayloadForGQL.timeStart = inputFromUI.timeStart;
        if (inputFromUI.timeEnd) equipmentPayloadForGQL.timeEnd = inputFromUI.timeEnd;
        if (inputFromUI.cycle !== undefined) equipmentPayloadForGQL.cycle = Number(inputFromUI.cycle);

        const mutation = {
            query: `
                mutation CreateEquiment($equipment: CreateEquiment!) { 
                    createEquiment(equipment: $equipment) {
                        id
                        categoryId
                        homeId
                        areaId 
                        title
                        description
                        timeStart
                        timeEnd
                        turnOn 
                        cycle
                        status
                    }
                }
            `,
            variables: { 
                equipment: equipmentPayloadForGQL
            } 
        };
        try {
            console.log("[deviceService] Creating equipment with variables:", JSON.stringify(mutation.variables, null, 2));
            const response = await apiClient.post<GraphQLMutationResponse<{ createEquiment: Equipment }>>('/query', mutation);
            if (response.data?.errors) {
                console.error("[deviceService] GraphQL server errors:", response.data.errors);
                throw new Error(response.data.errors.map(e => `Path: ${e.path?.join('.')} - Message: ${e.message}`).join('; '));
            }
            if (!response.data?.data?.createEquiment) throw new Error("Failed to create equipment or no data returned.");
            console.log("[deviceService] Equipment created successfully:", response.data.data.createEquiment);
            return response.data.data.createEquiment;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            if (axios.isAxiosError(error) && error.response) { 
                console.error("[deviceService] Axios error:", error.message);
                console.error("[deviceService] Server Response Status:", error.response.status);
                console.error("[deviceService] Server Response Data (VALIDATION ERRORS HERE):", JSON.stringify(error.response.data, null, 2));
                if (error.response.data && Array.isArray((error.response.data as any).errors)) { 
                     throw new Error((error.response.data as any).errors.map((e: any) => `Path: ${e.path?.join('.')} - Message: ${e.message}`).join('; '));
                }
                throw new Error(`Request failed with status code ${error.response.status}: ${message}`);
            }
            console.error("[deviceService] Error creating equipment:", message);
            throw new Error(message);
        }
    },
    
    deleteEquipment: async (equipmentId: number): Promise<DeleteResponsePayload> => {
        const mutation = {
            query: `
                mutation DeleteEquipment($equipment: DeleteEquipment!) { 
                    deleteEquipment(equipment: $equipment) {
                        code
                        msg
                    }
                }
            `,
            variables: { equipment: { id: equipmentId } } 
        };
        try {
            console.log("[deviceService] Deleting equipment with ID:", equipmentId, "using variables:", JSON.stringify(mutation.variables, null, 2));
            const response = await apiClient.post<GraphQLMutationResponse<{ deleteEquipment: DeleteResponsePayload }>>('/query', mutation);
            if (response.data?.errors) {
                console.error("[deviceService] GraphQL server errors (DeleteEquipment):", response.data.errors);
                throw new Error(response.data.errors.map(e => `Path: ${e.path?.join('.')} - Message: ${e.message}`).join('; '));
            }
            if (!response.data?.data?.deleteEquipment) throw new Error("Failed to delete equipment or no confirmation returned.");
            console.log("[deviceService] Equipment deleted confirmation:", response.data.data.deleteEquipment);
            return response.data.data.deleteEquipment;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
             if (axios.isAxiosError(error) && error.response) {
                console.error("[deviceService] Axios error deleting equipment:", error.message);
                console.error("[deviceService] Server Response Status (Delete):", error.response.status);
                console.error("[deviceService] Server Response Data (Delete):", JSON.stringify(error.response.data, null, 2));
                 if (error.response.data && Array.isArray((error.response.data as any).errors)) {
                     throw new Error((error.response.data as any).errors.map((e: any) => `Path: ${e.path?.join('.')} - Message: ${e.message}`).join('; '));
                }
            } else {
                console.error("[deviceService] Error deleting equipment:", message);
            }
            throw new Error(message);
        }
    },

    toggleDeviceState: async (deviceInput: DeviceInput): Promise<{ success: boolean; message?: string; id?: number; turnOn?: boolean }> => {
        const mutation = {
            query: `
                mutation ToggleDevice($device: DeviceInput!) {
                    toggleDevice(device: $device)
                }
            `,
            variables: { device: deviceInput } 
        };
        try {
            console.log(`[deviceService] Attempting to toggle device ${deviceInput.id} to ${deviceInput.turnOn} via GraphQL with input:`, JSON.stringify(deviceInput, null, 2));
            const response = await apiClient.post<GraphQLMutationResponse<{ toggleDevice: boolean | number | string }>>('/query', mutation);
            
            if (response.data?.errors) throw new Error(response.data.errors.map(e => `Path: ${e.path?.join('.')} - Message: ${e.message}`).join('; '));
            
            const toggleResult = response.data?.data?.toggleDevice;
            console.log(`[deviceService] Toggle device response from GraphQL:`, toggleResult);

            if (toggleResult !== undefined && toggleResult !== null && toggleResult !== false) { 
                 console.log(`[deviceService] Toggled device ${deviceInput.id} successfully via GraphQL.`);
                return { success: true, id: deviceInput.id, turnOn: deviceInput.turnOn, message: String(toggleResult) };
            }
            console.warn(`[deviceService] Toggle device ${deviceInput.id} did not return expected success from GraphQL. Response:`, toggleResult);
            throw new Error("Failed to toggle device or unexpected response.");

        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            console.error(`[deviceService] Error toggling device ${deviceInput.id} via GraphQL.`, message);
            throw new Error(message);
        }
    }
};
// Helper để import axios cho type checking trong catch block
import axios from 'axios';
