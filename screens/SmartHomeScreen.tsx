// screens/SmartHomeScreen.tsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { StyleSheet, View, ScrollView, RefreshControl, Alert, Platform, StatusBar, SafeAreaView } from "react-native";
import { Text, Card, Avatar, IconButton, useTheme, ActivityIndicator, Button, Modal, Portal, TextInput, Divider, FAB, MD3Theme, Switch as PaperSwitch } from "react-native-paper";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { AppTabParamList } from "../navigation/AppNavigator";
import { deviceService, Home as HomeScreenData, Equipment as SmartDevice, Area, HomeInput, AreaInput, EquipmentInput, DeviceInput } from "../services/deviceService";
import { useAuthStore } from "../store/authStore";

type SmartHomeScreenProps = BottomTabScreenProps<AppTabParamList, "HomeTab">;

const getDeviceIcon = (device: SmartDevice): string => {
    switch (device.categoryId) {
        case 1: // Lighting
            return device.turnOn ? 'lightbulb-on-variant-outline' : 'lightbulb-variant-outline';
        case 2: // Heating
            return 'thermometer-lines';
        case 3: // Security
            return 'shield-check-outline';
        default:
            return 'cog-outline';
    }
};

// Function to create styles, accepting theme
const createSmartHomeStyles = (theme: MD3Theme) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    container: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: 16,
        paddingTop: 16, 
        paddingBottom: 96, 
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: theme.colors.background,
    },
    loadingText: {
        marginTop: 10, 
        color: theme.colors.onSurface,
        fontSize: 16,
    },
    errorText: {
        color: theme.colors.error, 
        marginVertical: 10, 
        textAlign: 'center',
        fontSize: 16,
    },
    marginTopSm: {
        marginTop: 10
    },
    welcomeText: {
        color: theme.colors.onSurface, 
        marginVertical: 15, 
        textAlign: 'center', 
        fontSize: 18,
        lineHeight: 26,
    },
    centeredInfo: {
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 30,
        marginVertical: 20,
        backgroundColor: theme.colors.surfaceVariant,
        borderRadius: 16, 
    },
    centeredInfoIcon: {
        backgroundColor: 'transparent',
        marginBottom: 8,
    },
    centeredInfoText: {
        color: theme.colors.onSurfaceVariant,
        marginTop: 10, 
        textAlign: 'center',
        fontSize: 16,
        paddingHorizontal: 10,
    },
    header: {
        marginBottom: 24, 
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16, 
        paddingVertical:20, 
        backgroundColor: theme.colors.surface, 
        borderRadius: 20, 
        elevation: 5, 
        shadowColor: theme.colors.shadow, 
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
    },
    headerTextContainer: {
        flex: 1, 
        alignItems: 'flex-start',
        marginRight: 8, 
    },
    headerHomeName: {
        color: theme.colors.onSurface,
        fontWeight: 'bold', 
        fontSize: 24, 
        lineHeight: 30,
    },
    headerLocation: {
        color: theme.colors.secondary, 
        fontSize: 15, 
        display: 'flex',
        alignItems: 'center',
        marginTop: 4,
    },
    headerActions: {
        flexDirection: 'row',
    },
    actionButton: { 
        marginHorizontal: 0, 
        borderRadius: 12,
    },
    actionButtonSmall: { 
        marginHorizontal: 0, 
        padding: 0, 
        borderRadius: 10,
        minWidth: 36, 
        minHeight: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inlineIcon: {
        backgroundColor: 'transparent', 
        marginRight: 6, 
    },
    section: {
        marginBottom: 28, 
    },
    areaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center', 
        marginBottom: 16, 
        paddingBottom: 12, 
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.outlineVariant,
    },
    areaTitle: {
        color: theme.colors.primary,
        flex: 1, // Cho phép title co giãn và đẩy actions về cuối
        fontSize: 20, 
        fontWeight: '600',
        marginRight: 8, 
    },
    areaActions: { 
        flexDirection: 'row',
        alignItems: 'center',
    },
    addAreaButton: {
        marginVertical: 20,
        borderRadius: 20,
        paddingVertical: 6, 
    },
    addAreaButtonLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    addAreaButtonContent: {
        paddingVertical: 10, 
    },
    addEquipmentButton: {
        marginVertical: 12,
        alignSelf: 'flex-start',
        paddingHorizontal: 16, 
        borderRadius: 18,
        borderColor: theme.colors.primary,
        borderWidth: 1.5,
    },
    addEquipmentButtonLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    emptyText: {
        color: theme.colors.onSurfaceVariant, 
        fontStyle: 'italic', 
        textAlign: 'center',
        paddingVertical: 24,
        fontSize: 15,
    },
    deviceCard: {
        marginBottom: 20, // More space between cards
        elevation: 2, // Subtle elevation
        backgroundColor: theme.colors.onPrimary, // Use a slightly different surface for cards
        borderRadius: 16,
        overflow: 'hidden', 
    },
    deviceCardContentRow: { // New style for the main row in the card
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12, // Vertical padding for the row
        paddingHorizontal: 12, // Horizontal padding for the row
    },
    deviceAvatarIconContainer: {
        width: 48, // Adjusted size
        height: 48,
        borderRadius: 24, 
        borderWidth: 1.5, // Thinner border
        justifyContent: 'center', 
        alignItems: 'center',     
        marginRight: 12, 
    },
    deviceAvatarIcon: {
        backgroundColor: 'transparent',
    },
    deviceInfoContainer: { // Container for title and subtitle
        flex: 1, // Allow this to take up available space
        justifyContent: 'center',
    },
    deviceTitleText: {
        fontWeight: '600',
        fontSize: 17, 
        color: theme.colors.onSurface,
        marginBottom: 2, // Space between title and subtitle
    },
    deviceSubtitle: {
        color: theme.colors.onSurfaceVariant, 
        fontSize: 12, // Smaller subtitle
    },
    deviceCardActions: { // Container for Switch and Delete button
        flexDirection: 'row', 
        alignItems: 'center',
        marginLeft: 'auto', // Push actions to the right
    },
    deviceSwitch: {
        // transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }], // Slightly smaller switch
        marginRight: -4, // Reduce space before delete icon if IconButton has padding
    },
    deleteIcon: {
        // marginLeft: -4, // Adjust if needed
    },
    deviceDescriptionContainer: { // New container for description
        paddingHorizontal: 16,
        paddingBottom: 16, // Padding below description
        paddingTop: 4, // Padding above description if there's a title
    },
    deviceDescription: {
        color: theme.colors.onSurfaceVariant, 
        fontSize: 14, 
        lineHeight: 20, 
    },
    modalContainer: {
        padding: 24,
        marginHorizontal: 20,
        marginVertical: Platform.OS === 'ios' ? 60 : 40,
        borderRadius: 16,
        backgroundColor: theme.colors.elevation?.level3 || theme.colors.surface,
        maxHeight: '85%',
    },
    modalTitle: {
        marginBottom: 24,
        textAlign: 'center',
        color: theme.colors.onSurface,
        fontSize: 20,
        fontWeight: '600',
    },
    modalInput: {
        marginBottom: 16,
        backgroundColor: theme.colors.background, 
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 24,
    },
    modalButton: {
        marginLeft: 12,
        minWidth: 90,
        paddingHorizontal: 8,
    },
    divider: {
        marginVertical: 28, 
        backgroundColor: theme.colors.outlineVariant,
        height: 1, 
    },
    fab: {
        position: 'absolute',
        margin: 20,
        right: 0,
        bottom: 0,
        borderRadius: 28,
    },
    largeButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        marginVertical: 16,
        borderRadius: 20,
        elevation: 2,
    }
});


export default function SmartHomeScreen({ navigation }: SmartHomeScreenProps) {
    const theme = useTheme();
    const { userToken } = useAuthStore.getState();
    const styles = useMemo(() => createSmartHomeStyles(theme), [theme]);

    const [homeData, setHomeData] = useState<HomeScreenData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState<'createHome' | 'editHome' | 'createArea' | 'editArea' | 'createEquipment' | null>(null);
    
    const [homeNameInput, setHomeNameInput] = useState('');
    const [homeLocationInput, setHomeLocationInput] = useState('');
    const [editingHomeId, setEditingHomeId] = useState<number | null>(null);

    const [areaNameInput, setAreaNameInput] = useState('');
    const [editingAreaId, setEditingAreaId] = useState<number | null>(null);
    const [currentHomeIdForArea, setCurrentHomeIdForArea] = useState<number | null>(null);

    const [equipmentTitleInput, setEquipmentTitleInput] = useState('');
    const [equipmentDescriptionInput, setEquipmentDescriptionInput] = useState('');
    const [equipmentCategoryIdInput, setEquipmentCategoryIdInput] = useState('');
    const [currentAreaIdForEquipment, setCurrentAreaIdForEquipment] = useState<number | null>(null);
    
    const fetchHomeScreenData = useCallback(async (showLoadingIndicator = true) => {
        if (!userToken) {
            if (showLoadingIndicator) setIsLoading(false);
            setRefreshing(false);
            return;
        }
        if (showLoadingIndicator && !refreshing) setIsLoading(true);
        setError(null);
        try {
            const data = await deviceService.getHomeScreenData();
            setHomeData(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Lỗi không xác định khi tải dữ liệu.";
            setError(errorMessage);
        } finally {
            if (showLoadingIndicator) setIsLoading(false);
            setRefreshing(false);
        }
    }, [userToken, refreshing]);

    useEffect(() => {
        fetchHomeScreenData();
    }, [fetchHomeScreenData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchHomeScreenData(false);
    }, [fetchHomeScreenData]);

    const hideModal = () => {
        setModalVisible(false);
        setModalType(null);
        setHomeNameInput('');
        setHomeLocationInput('');
        setEditingHomeId(null);
        setAreaNameInput('');
        setEditingAreaId(null);
        setCurrentHomeIdForArea(null);
        setEquipmentTitleInput('');
        setEquipmentDescriptionInput('');
        setEquipmentCategoryIdInput('');
        setCurrentAreaIdForEquipment(null);
        setIsSubmitting(false);
    };

    const openCreateHomeModal = () => {
        setModalType('createHome');
        setModalVisible(true);
    };

    const openEditHomeModal = (home: HomeScreenData) => {
        setModalType('editHome');
        setEditingHomeId(home.id);
        setHomeNameInput(home.homeName);
        setHomeLocationInput(home.location || '');
        setModalVisible(true);
    };

    const handleSaveHome = async () => {
        if (!homeNameInput.trim()) {
            Alert.alert("Lỗi", "Tên nhà không được để trống.");
            return;
        }
        setIsSubmitting(true);
        try {
            if (modalType === 'createHome') {
                const input: Omit<HomeInput, 'id'> = { 
                    homeName: homeNameInput.trim(), 
                    location: homeLocationInput.trim() || undefined
                };
                await deviceService.createHome(input);
                Alert.alert("Thành công", "Nhà mới đã được tạo.");
            } else if (modalType === 'editHome' && editingHomeId !== null) {
                const input: HomeInput = { 
                    id: editingHomeId, 
                    homeName: homeNameInput.trim(), 
                    location: homeLocationInput.trim() || undefined 
                };
                await deviceService.updateHome(input);
                Alert.alert("Thành công", "Thông tin nhà đã được cập nhật.");
            }
            hideModal();
            fetchHomeScreenData(false);
        } catch (apiError: unknown) {
            const message = apiError instanceof Error ? apiError.message : String(apiError);
            Alert.alert("Lỗi", `Không thể lưu thông tin nhà: ${message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteHome = (homeId: number) => {
        Alert.alert(
            "Xác nhận xóa nhà",
            "Bạn có chắc chắn muốn xóa ngôi nhà này? Tất cả khu vực và thiết bị bên trong cũng sẽ bị xóa.",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa", style: "destructive", onPress: async () => {
                        setIsLoading(true);
                        try {
                            const response = await deviceService.deleteHome(homeId);
                            Alert.alert("Thành công", response.msg || "Nhà đã được xóa.");
                            setHomeData(null);
                            fetchHomeScreenData(true);
                        } catch (apiError: unknown) {
                            const message = apiError instanceof Error ? apiError.message : String(apiError);
                            Alert.alert("Lỗi", `Không thể xóa nhà: ${message}`);
                        } finally {
                            setIsLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const openCreateAreaModal = (homeId: number) => {
        setModalType('createArea');
        setCurrentHomeIdForArea(homeId);
        setModalVisible(true);
    };
    
    const openEditAreaModal = (area: Area) => {
        setModalType('editArea');
        setEditingAreaId(area.id);
        setCurrentHomeIdForArea(area.homeId);
        setAreaNameInput(area.name);
        setModalVisible(true);
    };

    const handleSaveArea = async () => {
        if (!areaNameInput.trim()) {
            Alert.alert("Lỗi", "Tên khu vực không được để trống.");
            return;
        }
        setIsSubmitting(true);
        try {
            if (modalType === 'createArea' && currentHomeIdForArea !== null) {
                const input: Omit<AreaInput, 'id'> = { 
                    homeId: currentHomeIdForArea, 
                    name: areaNameInput.trim() 
                };
                await deviceService.createArea(input);
                Alert.alert("Thành công", "Khu vực mới đã được tạo.");
            } else if (modalType === 'editArea' && editingAreaId !== null) {
                const input: AreaInput = { 
                    id: editingAreaId, 
                    name: areaNameInput.trim(),
                    homeId: currentHomeIdForArea 
                };
                await deviceService.updateArea(input);
                Alert.alert("Thành công", "Tên khu vực đã được cập nhật.");
            }
            hideModal();
            fetchHomeScreenData(false);
        } catch (apiError: unknown) {
            const message = apiError instanceof Error ? apiError.message : String(apiError);
            Alert.alert("Lỗi", `Không thể lưu khu vực: ${message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteArea = (areaId: number, areaName: string) => {
         Alert.alert(
            "Xác nhận xóa khu vực",
            `Bạn có chắc chắn muốn xóa khu vực "${areaName}"? Tất cả thiết bị bên trong cũng sẽ bị xóa.`,
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa", style: "destructive", onPress: async () => {
                        setIsSubmitting(true);
                        try {
                            const response = await deviceService.deleteArea(areaId);
                            Alert.alert("Thành công", response.msg || `Khu vực "${areaName}" đã được xóa.`);
                            fetchHomeScreenData(false);
                        } catch (apiError: unknown) {
                            const message = apiError instanceof Error ? apiError.message : String(apiError);
                            Alert.alert("Lỗi", `Không thể xóa khu vực: ${message}`);
                        } finally {
                            setIsSubmitting(false);
                        }
                    }
                }
            ]
        );
    };

     const openCreateEquipmentModal = (areaId: number, homeId: number) => {
        setModalType('createEquipment');
        setCurrentAreaIdForEquipment(areaId);
        setCurrentHomeIdForArea(homeId);
        setModalVisible(true);
    };

    const handleSaveEquipment = async () => {
        if (!equipmentTitleInput.trim() || !equipmentCategoryIdInput.trim()) {
            Alert.alert("Lỗi", "Tên thiết bị và ID danh mục không được để trống.");
            return;
        }
        const categoryIdNum = parseInt(equipmentCategoryIdInput, 10);
        if (isNaN(categoryIdNum)) {
            Alert.alert("Lỗi", "ID danh mục phải là một số.");
            return;
        }
        setIsSubmitting(true);
        try {
            if (modalType === 'createEquipment' && currentHomeIdForArea !== null) {
                const newEquipment: Omit<EquipmentInputForService, 'id'> = { 
                    areaId: currentAreaIdForEquipment || undefined,
                    homeId: currentHomeIdForArea,
                    title: equipmentTitleInput.trim(),
                    description: equipmentDescriptionInput.trim() || undefined,
                    categoryId: categoryIdNum,
                    status: 'active', 
                };
                await deviceService.createEquipment(newEquipment);
                Alert.alert("Thành công", "Thiết bị mới đã được tạo.");
                hideModal();
                fetchHomeScreenData(false);
            }
        } catch (apiError: unknown) {
            const message = apiError instanceof Error ? apiError.message : String(apiError);
            Alert.alert("Lỗi", `Không thể tạo thiết bị: ${message}`);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDeleteEquipment = (equipmentId: number, equipmentName: string) => {
        Alert.alert(
            "Xác nhận xóa thiết bị",
            `Bạn có chắc chắn muốn xóa thiết bị "${equipmentName}"?`,
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa", style: "destructive", onPress: async () => {
                        setIsSubmitting(true);
                        try {
                            const response = await deviceService.deleteEquipment(equipmentId);
                            Alert.alert("Thành công", response.msg || `Thiết bị "${equipmentName}" đã được xóa.`);
                            fetchHomeScreenData(false);
                        } catch (apiError: unknown) {
                            const message = apiError instanceof Error ? apiError.message : String(apiError);
                            Alert.alert("Lỗi", `Không thể xóa thiết bị: ${message}`);
                        } finally {
                            setIsSubmitting(false);
                        }
                    }
                }
            ]
        );
    };

    const handleToggleDevice = async (deviceToToggle: SmartDevice) => {
        if (!homeData) return;
        
        const newTurnOnState = !deviceToToggle.turnOn;
        const deviceInput: DeviceInput = { id: deviceToToggle.id, turnOn: newTurnOnState };

        const originalHomeData = JSON.parse(JSON.stringify(homeData)); 

        setHomeData(prevHomeData => {
            if (!prevHomeData || !Array.isArray(prevHomeData.area)) return prevHomeData;
            const newAreas = prevHomeData.area.map(area => {
                if (area && Array.isArray(area.equipment)) {
                    return {
                        ...area,
                        equipment: area.equipment.map(eq =>
                            eq.id === deviceToToggle.id ? { ...eq, turnOn: newTurnOnState, status: newTurnOnState ? 'active' : 'inactive' } : eq
                        ),
                    };
                }
                return area;
            });
            return { ...prevHomeData, area: newAreas };
        });

        try {
            const result = await deviceService.toggleDeviceState(deviceInput);
            if (result.success) {
                console.log(`[SmartHomeScreen] Device ${deviceToToggle.id} toggled successfully via API.`);
            } else {
                throw new Error(result.message || "Toggle failed on server.");
            }
        } catch (toggleError: unknown) {
            console.error(`[SmartHomeScreen] Error toggling device ${deviceToToggle.id}:`, toggleError);
            const errorMessage = toggleError instanceof Error ? toggleError.message : 'Unknown error';
            Alert.alert("Lỗi", `Không thể thay đổi trạng thái thiết bị: ${errorMessage}`);
            setHomeData(originalHomeData);
        }
    };

    if (isLoading && !refreshing) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.centered}>
                    <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Đang tải dữ liệu nhà...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error && !homeData && !isLoading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.centered}>
                    <Avatar.Icon icon="alert-circle-outline" size={48} style={styles.centeredInfoIcon} color={theme.colors.error}/>
                    <Text style={styles.errorText}>{error}</Text>
                    <Button mode="contained" onPress={() => fetchHomeScreenData(true)}>Thử lại</Button>
                    <Button style={styles.marginTopSm} onPress={openCreateHomeModal} textColor={theme.colors.primary}>Tạo Nhà Mới</Button>
                </View>
            </SafeAreaView>
        );
    }
    
    if (!homeData && !isLoading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.centered}>
                    <Avatar.Icon icon="home-plus-outline" size={64} style={styles.centeredInfoIcon} color={theme.colors.primary}/>
                    <Text style={styles.welcomeText}>
                        Chào mừng! Bạn chưa có nhà nào.
                    </Text>
                    <Button mode="contained" icon="plus" onPress={openCreateHomeModal} style={styles.largeButton}>
                        Tạo Ngôi Nhà Đầu Tiên
                    </Button>
                </View>
            </SafeAreaView>
        );
    }
    
    const hasAnyDevice = homeData && Array.isArray(homeData.area) && homeData.area.some(
        area => area && Array.isArray(area.equipment) && area.equipment.length > 0
    );

    const renderModalContent = () => {
        switch (modalType) {
            case 'createHome':
            case 'editHome':
                return (
                    <>
                        <Text variant="headlineSmall" style={styles.modalTitle}>{modalType === 'createHome' ? 'Tạo Nhà Mới' : 'Chỉnh Sửa Nhà'}</Text>
                        <TextInput label="Tên nhà" value={homeNameInput} onChangeText={setHomeNameInput} mode="outlined" style={styles.modalInput} disabled={isSubmitting}/>
                        <TextInput label="Vị trí (Tùy chọn)" value={homeLocationInput} onChangeText={setHomeLocationInput} mode="outlined" style={styles.modalInput} disabled={isSubmitting}/>
                        <View style={styles.modalActions}>
                            <Button onPress={hideModal} style={styles.modalButton} textColor={theme.colors.error} disabled={isSubmitting}>Hủy</Button>
                            <Button onPress={handleSaveHome} mode="contained" style={styles.modalButton} loading={isSubmitting} disabled={isSubmitting}>Lưu</Button>
                        </View>
                    </>
                );
            case 'createArea':
            case 'editArea':
                 return (
                    <>
                        <Text variant="headlineSmall" style={styles.modalTitle}>{modalType === 'createArea' ? `Thêm Khu Vực vào "${homeData?.homeName}"` : 'Chỉnh Sửa Khu Vực'}</Text>
                        <TextInput label="Tên khu vực" value={areaNameInput} onChangeText={setAreaNameInput} mode="outlined" style={styles.modalInput} disabled={isSubmitting}/>
                        <View style={styles.modalActions}>
                            <Button onPress={hideModal} style={styles.modalButton} textColor={theme.colors.error} disabled={isSubmitting}>Hủy</Button>
                            <Button onPress={handleSaveArea} mode="contained" style={styles.modalButton} loading={isSubmitting} disabled={isSubmitting}>Lưu</Button>
                        </View>
                    </>
                );
            case 'createEquipment':
                 const currentAreaName = homeData?.area?.find(a => a.id === currentAreaIdForEquipment)?.name;
                return (
                    <>
                        <Text variant="headlineSmall" style={styles.modalTitle}>{`Thêm Thiết Bị vào "${currentAreaName || 'Khu vực không xác định'}"`}</Text>
                        <TextInput label="Tên thiết bị" value={equipmentTitleInput} onChangeText={setEquipmentTitleInput} mode="outlined" style={styles.modalInput} disabled={isSubmitting}/>
                        <TextInput label="Mô tả (Tùy chọn)" value={equipmentDescriptionInput} onChangeText={setEquipmentDescriptionInput} mode="outlined" style={styles.modalInput} multiline disabled={isSubmitting}/>
                        <TextInput label="ID Danh mục (1: Đèn, 2: Sưởi, 3: An ninh)" value={equipmentCategoryIdInput} onChangeText={setEquipmentCategoryIdInput} keyboardType="numeric" mode="outlined" style={styles.modalInput} disabled={isSubmitting}/>
                        <View style={styles.modalActions}>
                            <Button onPress={hideModal} style={styles.modalButton} textColor={theme.colors.error} disabled={isSubmitting}>Hủy</Button>
                            <Button onPress={handleSaveEquipment} mode="contained" style={styles.modalButton} loading={isSubmitting} disabled={isSubmitting}>Lưu</Button>
                        </View>
                    </>
                );
            default:
                return null;
        } 
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                contentContainerStyle={styles.contentContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} tintColor={theme.colors.primary}/>
                }
            >
                {homeData && (
                <>
                <View style={styles.header}>
                    <View style={styles.headerTextContainer}>
                        <Text variant="headlineMedium" style={styles.headerHomeName}>
                            {homeData.homeName || "Nhà của bạn"}
                        </Text>
                        {homeData.location && (
                            <Text variant="titleMedium" style={styles.headerLocation}>
                                <MaterialCommunityIcons name="map-marker-radius-outline" size={16} color={theme.colors.secondary} style={styles.inlineIcon} /> 
                                {homeData.location}
                            </Text>
                        )}
                    </View>
                    <View style={styles.headerActions}>
                        <IconButton icon="home-edit-outline" size={26} onPress={() => openEditHomeModal(homeData)} iconColor={theme.colors.primary} style={styles.actionButton} />
                        <IconButton icon="home-remove-outline" size={26} onPress={() => handleDeleteHome(homeData.id)} iconColor={theme.colors.error} style={styles.actionButton} />
                    </View>
                </View>
                <Button 
                    icon="plus-circle-outline" 
                    mode="elevated" 
                    onPress={() => openCreateAreaModal(homeData.id)} 
                    style={styles.addAreaButton}
                    labelStyle={styles.addAreaButtonLabel}
                    theme={{ roundness: 3 }} 
                    contentStyle={styles.addAreaButtonContent}
                >
                    Thêm Khu Vực Mới
                </Button>
                <Divider style={styles.divider}/>

                {!hasAnyDevice && !isLoading && Array.isArray(homeData.area) && homeData.area.length > 0 && (
                    <View style={styles.centeredInfo}>
                        <Avatar.Icon icon="lightbulb-alert-outline" size={54} style={styles.centeredInfoIcon} color={theme.colors.onSurfaceDisabled}/>
                        <Text style={styles.centeredInfoText}>
                            Các khu vực hiện tại chưa có thiết bị nào.
                        </Text>
                    </View>
                )}
                 {!hasAnyDevice && !isLoading && (!Array.isArray(homeData.area) || homeData.area.length === 0) && (
                     <View style={styles.centeredInfo}>
                        <Avatar.Icon icon="home-alert-outline" size={54} style={styles.centeredInfoIcon} color={theme.colors.onSurfaceDisabled}/>
                        <Text style={styles.centeredInfoText}>
                            Ngôi nhà này chưa có khu vực hoặc thiết bị nào.
                        </Text>
                    </View>
                 )}


                {Array.isArray(homeData.area) && homeData.area.map((areaItem: Area) => {
                    if (!areaItem) return null;
                    const areaEquipment = Array.isArray(areaItem.equipment) ? areaItem.equipment : [];

                    return (
                        <View key={areaItem.id} style={styles.section}>
                            <View style={styles.areaHeader}>
                                <Text variant="titleLarge" style={styles.areaTitle}>{areaItem.name}</Text>
                                <View style={styles.areaActions}>
                                     <IconButton icon="playlist-edit" size={24} onPress={() => openEditAreaModal(areaItem)} style={styles.actionButtonSmall} iconColor={theme.colors.primary}/>
                                     <IconButton icon="delete-variant" size={24} onPress={() => handleDeleteArea(areaItem.id, areaItem.name)} style={styles.actionButtonSmall} iconColor={theme.colors.error}/>
                                </View>
                            </View>
                             <Button 
                                icon="plus-box-multiple-outline"
                                mode="outlined" 
                                onPress={() => openCreateEquipmentModal(areaItem.id, homeData.id)} 
                                style={styles.addEquipmentButton}
                                textColor={theme.colors.primary}
                                theme={{ roundness: 3 }} 
                                labelStyle={styles.addEquipmentButtonLabel}
                            >
                                Thêm Thiết Bị
                            </Button>

                            {areaEquipment.length === 0 && !isLoading && (
                                <Text style={styles.emptyText}>Khu vực này chưa có thiết bị.</Text>
                            )}
                            {areaEquipment.map((device: SmartDevice) => {
                                if (!device) return null;
                                return (
                                    <Card key={device.id} style={styles.deviceCard}>
                                        {/* Sử dụng Card.Content hoặc View để bố cục nội dung bên trong Card */}
                                        <View style={styles.deviceCardContentRow}>
                                            <View style={[styles.deviceAvatarIconContainer, {borderColor: device.turnOn ? theme.colors.primary : theme.colors.outlineVariant}]}>
                                                <Avatar.Icon 
                                                    icon={getDeviceIcon(device)} 
                                                    style={styles.deviceAvatarIcon} 
                                                    color={device.turnOn ? theme.colors.primary : theme.colors.onSurfaceVariant} 
                                                    size={32} // Điều chỉnh kích thước icon trong avatar
                                                />
                                            </View>
                                            <View style={styles.deviceInfoContainer}>
                                                <Text variant="titleMedium" style={styles.deviceTitleText} numberOfLines={1}>{device.title}</Text>
                                                <Text variant="bodySmall" style={styles.deviceSubtitle}>
                                                    {/* {`Loại: ${device.categoryId} • Trạng thái: ${device.status || 'N/A'}`} */}
                                                    {`ID Cat: ${device.categoryId} • ${device.status || 'N/A'}`}
                                                </Text>
                                            </View>
                                            <View style={styles.deviceCardActions}>
                                                <PaperSwitch
                                                    value={device.turnOn}
                                                    onValueChange={() => handleToggleDevice(device)}
                                                    color={theme.colors.primary}
                                                    style={styles.deviceSwitch}
                                                />
                                                <IconButton
                                                    icon="delete-outline" 
                                                    iconColor={theme.colors.error}
                                                    size={24}
                                                    onPress={() => handleDeleteEquipment(device.id, device.title)}
                                                    style={styles.deleteIcon}
                                                />
                                            </View>
                                        </View>
                                        {device.description && (
                                            <View style={styles.deviceDescriptionContainer}>
                                                <Text style={styles.deviceDescription}>{device.description}</Text>
                                            </View>
                                        )}
                                    </Card>
                                );
                            })}
                             <Divider style={styles.divider}/>
                        </View>
                    );
                })}
                </> 
                )}
            </ScrollView>
            
            <Portal>
                {!homeData && !isLoading && (
                    <FAB
                        icon="home-plus-outline"
                        style={[styles.fab, { backgroundColor: theme.colors.primary }]} 
                        color={theme.colors.onPrimary} 
                        onPress={openCreateHomeModal}
                        label="Tạo Nhà Mới"
                        variant="primary"
                    />
                )}
                <Modal 
                    visible={modalVisible} 
                    onDismiss={hideModal} 
                    contentContainerStyle={styles.modalContainer}
                >
                    <ScrollView keyboardShouldPersistTaps="handled"> 
                    {renderModalContent()}
                    </ScrollView>
                </Modal>
            </Portal>
        </SafeAreaView>
    );
}
