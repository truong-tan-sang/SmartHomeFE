// screens/SmartHomeScreen.tsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { StyleSheet, View, ScrollView, RefreshControl, Alert, Platform, StatusBar, SafeAreaView } from "react-native"; // Added StatusBar, SafeAreaView
import { Text, Card, Avatar, IconButton, useTheme, ActivityIndicator, Button, Modal, Portal, TextInput, Divider, FAB, MD3Theme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { AppTabParamList } from "../navigation/AppNavigator";
import { deviceService, Home as HomeScreenData, Equipment as SmartDevice, Area, HomeInput, AreaInput, EquipmentInput, DeviceInput } from "../services/deviceService";
import { useAuthStore } from "../store/authStore";

type SmartHomeScreenProps = BottomTabScreenProps<AppTabParamList, "HomeTab">;

const getDeviceIcon = (device: SmartDevice): string => {
    switch (device.categoryId) {
        case 1:
            return device.turnOn ? 'lightbulb-on-outline' : 'lightbulb-off-outline';
        case 2:
            return 'thermometer';
        case 3:
            return 'shield-lock-outline';
        default:
            return device.turnOn ? 'toggle-switch' : 'toggle-switch-off-outline';
    }
};

// Function to create styles, accepting theme
const createSmartHomeStyles = (theme: MD3Theme) => StyleSheet.create({
    safeArea: { // Style cho SafeAreaView
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, // Thêm padding cho Android status bar
    },
    container: { // Style cho View bên trong SafeAreaView, hoặc ScrollView nếu không dùng SafeAreaView trực tiếp cho ScrollView
        flex: 1,
        // backgroundColor đã được set ở safeArea
    },
    contentContainer: { // Style cho contentContainer của ScrollView
        padding: 16,
        paddingBottom: 96,
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        // backgroundColor đã được set ở safeArea hoặc container
    },
    loadingText: {
        marginTop: 10,
        color: theme.colors.onSurface
    },
    errorText: {
        color: theme.colors.error,
        marginVertical: 10,
        textAlign: 'center'
    },
    marginTopSm: {
        marginTop: 10
    },
    welcomeText: {
        color: theme.colors.onSurface,
        marginVertical: 15,
        textAlign: 'center',
        fontSize: 16
    },
    centeredInfo: {
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 20,
        marginVertical: 10,
    },
    centeredInfoIcon: {
        backgroundColor: 'transparent',
    },
    centeredInfoText: {
        color: theme.colors.onSurfaceDisabled,
        marginTop: 10,
        textAlign: 'center'
    },
    header: {
        // marginBottom: 16, // Di chuyển padding/margin vào contentContainer hoặc headerContainer
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 8, // Giữ padding ngang cho nội dung bên trong header
        paddingVertical: 12,
        backgroundColor: theme.colors.surfaceVariant,
        borderRadius: 12,
        elevation: 2,
        marginTop: Platform.OS === 'ios' ? 0 : 8, // Thêm chút margin top cho Android nếu không dùng SafeAreaView trực tiếp
        // Hoặc để contentContainer của ScrollView xử lý padding top
    },
    headerTextContainer: {
        flex: 1,
        alignItems: 'flex-start',
    },
    headerHomeName: {
        color: theme.colors.onSurface,
        fontWeight: 'bold',
    },
    headerLocation: {
        color: theme.colors.secondary,
        marginLeft: 0,
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
    },
    headerActions: {
        flexDirection: 'row',
    },
    actionButton: {
        marginHorizontal: -4,
    },
    actionButtonSmall: {
        margin: 0,
        padding: 4,
    },
    inlineIcon: {
        backgroundColor: 'transparent',
        marginRight: 4,
    },
    section: {
        marginBottom: 20,
    },
    areaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.outlineVariant,
    },
    areaActions: {
        flexDirection: 'row',
    },
    areaTitle: {
        color: theme.colors.primary,
        flex: 1,
    },
    addAreaButton: {
        marginVertical: 16,
        borderRadius: 8,
    },
    addAreaButtonLabel: {
        fontSize: 16
    },
    addAreaButtonContent: {
        paddingVertical: 6
    },
    addEquipmentButton: {
        marginVertical: 10,
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        borderRadius: 8,
        borderColor: theme.colors.primary,
    },
    addEquipmentButtonLabel: {
        fontSize: 14
    },
    emptyText: {
        color: theme.colors.onSurfaceVariant,
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: 20,
    },
    deviceCard: {
        marginBottom: 16,
        elevation: 3,
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
    },
    deviceAvatarIcon: {
        backgroundColor: theme.colors.primaryContainer
    },
    deviceCardTitle: {
        paddingRight: 0
    },
    deviceSubtitle: {
        color: theme.colors.onSurfaceVariant,
        opacity: 0.8,
        fontSize: 12,
    },
    deviceCardActions: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 8,
    },
    deviceContent: {
        paddingTop: 4,
        paddingBottom: 12,
        paddingHorizontal: 16,
    },
    deviceDescription: {
        color: theme.colors.onSurfaceVariant,
        fontSize: 13,
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
        minWidth: 80,
    },
    divider: {
        marginVertical: 20,
        backgroundColor: theme.colors.outlineVariant,
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
        borderRadius: 8,
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
            console.log("[SmartHomeScreen] No user token found, skipping API call.");
            if (showLoadingIndicator) setIsLoading(false);
            setRefreshing(false);
            return;
        }
        if (showLoadingIndicator && !refreshing) setIsLoading(true);
        console.log("[SmartHomeScreen] Attempting to fetch home screen data...");
        setError(null);
        try {
            const data = await deviceService.getHomeScreenData();
            setHomeData(data);
            console.log("[SmartHomeScreen] Home screen data fetched:", data);
        } catch (err) {
            console.error("[SmartHomeScreen] Error fetching home screen data:", err);
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
        console.log("[SmartHomeScreen] Refreshing home screen data...");
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
        } catch (apiError: unknown) { // Explicitly type apiError as unknown
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
                const newEquipment: Omit<EquipmentInput, 'id'> = {
                    areaId: currentAreaIdForEquipment || undefined,
                    homeId: currentHomeIdForArea,
                    title: equipmentTitleInput.trim(),
                    description: equipmentDescriptionInput.trim() || undefined,
                    categoryId: categoryIdNum,
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
        console.log(`[SmartHomeScreen] User trying to toggle device ${deviceToToggle.id} (${deviceToToggle.title})`);
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
        } catch (toggleError: unknown) { // Changed type to unknown
            console.error(`[SmartHomeScreen] Error toggling device ${deviceToToggle.id}:`, toggleError);
            // Type guard to safely access message property
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
                    <Avatar.Icon icon="alert-circle-outline" size={48} style={styles.centeredInfoIcon} color={theme.colors.error} />
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
                    <Avatar.Icon icon="home-plus-outline" size={64} style={styles.centeredInfoIcon} color={theme.colors.primary} />
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
                        <TextInput label="Tên nhà" value={homeNameInput} onChangeText={setHomeNameInput} mode="outlined" style={styles.modalInput} disabled={isSubmitting} />
                        <TextInput label="Vị trí (Tùy chọn)" value={homeLocationInput} onChangeText={setHomeLocationInput} mode="outlined" style={styles.modalInput} disabled={isSubmitting} />
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
                        <TextInput label="Tên khu vực" value={areaNameInput} onChangeText={setAreaNameInput} mode="outlined" style={styles.modalInput} disabled={isSubmitting} />
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
                        <TextInput label="Tên thiết bị" value={equipmentTitleInput} onChangeText={setEquipmentTitleInput} mode="outlined" style={styles.modalInput} disabled={isSubmitting} />
                        <TextInput label="Mô tả (Tùy chọn)" value={equipmentDescriptionInput} onChangeText={setEquipmentDescriptionInput} mode="outlined" style={styles.modalInput} multiline disabled={isSubmitting} />
                        <TextInput label="ID Danh mục (1: Đèn, 2: Sưởi, 3: An ninh)" value={equipmentCategoryIdInput} onChangeText={setEquipmentCategoryIdInput} keyboardType="numeric" mode="outlined" style={styles.modalInput} disabled={isSubmitting} />
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
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />
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
                                        <Avatar.Icon size={18} icon="map-marker-outline" style={styles.inlineIcon} color={theme.colors.secondary} /> {homeData.location}
                                    </Text>
                                )}
                            </View>
                            <View style={styles.headerActions}>
                                <IconButton icon="pencil" size={24} onPress={() => openEditHomeModal(homeData)} iconColor={theme.colors.primary} style={styles.actionButton} />
                                <IconButton icon="delete-outline" size={24} onPress={() => handleDeleteHome(homeData.id)} iconColor={theme.colors.error} style={styles.actionButton} />
                            </View>
                        </View>
                        <Button
                            icon="plus-circle-outline"
                            mode="elevated"
                            onPress={() => openCreateAreaModal(homeData.id)}
                            style={styles.addAreaButton}
                            labelStyle={styles.addAreaButtonLabel}
                            theme={{ roundness: 2 }}
                            contentStyle={styles.addAreaButtonContent}
                        >
                            Thêm Khu Vực
                        </Button>
                        <Divider style={styles.divider} />

                        {!hasAnyDevice && !isLoading && Array.isArray(homeData.area) && homeData.area.length > 0 && (
                            <View style={styles.centeredInfo}>
                                <Avatar.Icon icon="lightbulb-alert-outline" size={48} style={styles.centeredInfoIcon} color={theme.colors.onSurfaceDisabled} />
                                <Text style={styles.centeredInfoText}>
                                    Các khu vực hiện tại chưa có thiết bị nào.
                                </Text>
                            </View>
                        )}
                        {!hasAnyDevice && !isLoading && (!Array.isArray(homeData.area) || homeData.area.length === 0) && (
                            <View style={styles.centeredInfo}>
                                <Avatar.Icon icon="home-alert-outline" size={48} style={styles.centeredInfoIcon} color={theme.colors.onSurfaceDisabled} />
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
                                            <IconButton icon="pencil-outline" size={20} onPress={() => openEditAreaModal(areaItem)} style={styles.actionButtonSmall} iconColor={theme.colors.primary} />
                                            <IconButton icon="delete-outline" size={20} onPress={() => handleDeleteArea(areaItem.id, areaItem.name)} style={styles.actionButtonSmall} iconColor={theme.colors.error} />
                                        </View>
                                    </View>
                                    <Button
                                        icon="plus-box-outline"
                                        mode="outlined"
                                        onPress={() => openCreateEquipmentModal(areaItem.id, homeData.id)}
                                        style={styles.addEquipmentButton}
                                        textColor={theme.colors.primary}
                                        theme={{ roundness: 2 }}
                                        labelStyle={styles.addEquipmentButtonLabel}
                                    >
                                        Thêm Thiết Bị
                                    </Button>

                                    {areaEquipment.length === 0 && (
                                        <Text style={styles.emptyText}>Khu vực này chưa có thiết bị.</Text>
                                    )}
                                    {areaEquipment.map((device: SmartDevice) => {
                                        if (!device) return null;
                                        return (
                                            <Card key={device.id} style={styles.deviceCard}>
                                                <Card.Title
                                                    title={device.title}
                                                    titleNumberOfLines={2}
                                                    subtitle={`ID Cat: ${device.categoryId} - ${device.status || 'N/A'}`}
                                                    subtitleStyle={styles.deviceSubtitle}
                                                    left={(props) => <Avatar.Icon {...props} icon={getDeviceIcon(device)} style={styles.deviceAvatarIcon} color={theme.colors.onPrimaryContainer} />}
                                                    right={(props) => (
                                                        <View style={styles.deviceCardActions}>
                                                            <IconButton
                                                                {...props}
                                                                icon={device.turnOn ? "power" : "power-off"}
                                                                iconColor={device.turnOn ? theme.colors.primary : theme.colors.onSurfaceDisabled}
                                                                onPress={() => handleToggleDevice(device)}
                                                                size={24}
                                                            />
                                                            <IconButton
                                                                {...props}
                                                                icon="delete-outline"
                                                                iconColor={theme.colors.error}
                                                                size={22}
                                                                onPress={() => handleDeleteEquipment(device.id, device.title)}
                                                            />
                                                        </View>
                                                    )}
                                                    style={styles.deviceCardTitle}
                                                />
                                                <Card.Content style={styles.deviceContent}>
                                                    <Text style={styles.deviceDescription}>{device.description || "Không có mô tả"}</Text>
                                                </Card.Content>
                                            </Card>
                                        );
                                    })}
                                    <Divider style={styles.divider} />
                                </View>
                            );
                        })}
                    </>
                )}
            </ScrollView>

            <Portal>
                {!homeData && !isLoading && (
                    <FAB
                        icon="home-plus"
                        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                        color={theme.colors.onPrimary}
                        onPress={openCreateHomeModal}
                        label="Tạo Nhà Mới"
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
