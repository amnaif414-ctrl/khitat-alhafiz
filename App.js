import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Alert, I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const C = { bg: '#0D1B2A', card: '#1B263B', gold: '#E0A82E', text: '#FFFFFF', gray: '#778DA9', green: '#4CAF50', red: '#E63946' };

const T = {
  home: 'الرئيسية', counter: 'عداد', change: 'تغيير المقدار', profile: 'ملف', more: 'المزيد',
  todayPlan: 'الخطة اليومية بالترتيب', face: 'وجه', hifzPlan: 'خطة الحفظ',
  yesterday: 'تكرار محفوظ الأمس', listen: 'الاستماع للقارئ', tafsir: 'قراءة التفسير',
  record: 'تسجيل الحفظ الجديد', repeat: 'تكرار الوجه غيباً', rabt: 'الربط', murajaah: 'المراجعة',
  done: 'تأكيد إتمام خطة اليوم', mubarak: 'مبارك', accepted: 'تقبل الله منك. تم إتمام برنامج اليوم',
  tasbeeh: 'عداد التسبيح / الحفظ', resetCounter: 'تصفير العداد', changeTitle: 'تغيير المقدار',
  currentFace: 'رقم الوجه الذي تحفظه', dailyHours: 'مدة الخطة اليومية', hoursAvailable: 'الساعات المتاحة',
  hour: 'ساعة', dailyAmount: 'مقدار الحفظ اليومي', facesDaily: 'عدد الأوجه يومياً', faceUnit: 'وجه',
  repeatCount: 'عدد تكرارات الوجه', repeatUnit: 'مرة', repeatRange: 'من 20 إلى 50',
  hafiz: 'حافظ القرآن', journey: 'رحلة الحفظ المباركة', progress: 'التقدم العام',
  from: 'من', totalDone: 'إجمالي الإتمام', streak: 'أيام متتالية', lastDone: 'آخر إتمام', none: 'لا يوجد',
  currentFaceLabel: 'الوجه الحالي', sync: 'سجّل الدخول لمزامنة بياناتك', resetToday: 'إعادة تعيين مهام اليوم',
  resetAll: 'تصفير كل البيانات', about: 'حول التطبيق', version: 'الإصدار 1.0.0', intention: 'النية: لله تعالى',
  footer: 'تقبل الله منّا ومنكم صالح الأعمال 🤲', confirm: 'تأكيد', confirmReset: 'هل تريد تصفير كل البيانات؟',
  cancel: 'إلغاء', tasksNotDone: 'لم تكمل جميع المهام بعد', completeAllFirst: 'أكمل جميع المهام أولاً',
  totalDays: 'مجموع الأيام', times: 'مرات', time: 'مرة', fromFace: 'من وجه'
};

const STORAGE_KEY = 'hifzData_v9';

export default function App() {
  const [tab, setTab] = useState(T.home);
  const [face, setFace] = useState(63);
  const [hours, setHours] = useState(12);
  const [facesPerDay, setFacesPerDay] = useState(1);
  const [repeatCount, setRepeatCount] = useState(40);
  const [tasks, setTasks] = useState({
    yesterday: { name: T.yesterday, count: 5, done: 0, icon: 'refresh' },
    listen: { name: T.listen, count: 3, done: 0, icon: 'headset' },
    tafsir: { name: T.tafsir, count: 1, done: 0, icon: 'book' },
    record: { name: T.record, count: 3, done: 0, icon: 'mic' },
    repeat: { name: T.repeat, count: 40, done: 0, icon: 'repeat' },
    rabt: { name: T.rabt, count: 0, done: 0, icon: 'link' },
    murajaah: { name: T.murajaah, count: 0, done: 0, icon: 'library' }
  });
  const [counter, setCounter] = useState(0);
  const [profile, setProfile] = useState({ completedFaces: 62, totalDays: 62, streak: 0, lastDate: '' });

  const isFirstRender = useRef(true);

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    setTasks(p => ({
...p,
      repeat: {...p.repeat, count: repeatCount }
    }));
  }, [repeatCount]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    saveData();
  }, [face, hours, facesPerDay, repeatCount, tasks, counter, profile]);

  const loadData = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const p = JSON.parse(data);
        setFace(p.face?? 63);
        setHours(p.hours?? 12);
        setFacesPerDay(p.facesPerDay?? 1);
        setRepeatCount(p.repeatCount?? 40);
        setTasks(p.tasks?? tasks);
        setCounter(p.counter?? 0);
        setProfile(p.profile?? profile);
      }
    } catch (e) {
      console.log('Load error:', e);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ face, hours, facesPerDay, repeatCount, tasks, counter, profile }));
    } catch (e) {
      console.log('Save error:', e);
    }
  };

  const getRabtRange = () => {
    const totalMemorized = Math.max(0, face - 1);
    if (totalMemorized === 0) return null;

    // نهاية الربط = حفظ قبل أمس = الوجه الحالي - 3
    const endFace = Math.max(0, face - 3);
    if (endFace <= 0) return null;

    // البداية = نهاية الربط - 33 عشان يكون 34 وجه
    const startFace = Math.max(1, endFace - 33);

    if (startFace === endFace) return `${endFace}`;
    return `${startFace} ← ${endFace}`;
  };

  const getMurajaahRange = () => {
    const endRabt = Math.max(0, face - 3);
    // المراجعة = اللي قبل بداية الربط
    const beforeRabt = Math.max(0, endRabt - 34);
    if (beforeRabt <= 0) return null;

    // نقسمها على 6 أجزاء
    const chunkSize = Math.ceil(beforeRabt / 6);
    const dayIndex = (profile.totalDays - 1) % 6; // 0 إلى 5

    const startFace = dayIndex * chunkSize + 1;
    const endFace = Math.min(startFace + chunkSize - 1, beforeRabt);

    if (startFace > beforeRabt) return null;
    if (startFace === endFace) return `${startFace}`;
    return `${startFace} ← ${endFace}`;
  };

  const updateTask = (key) => {
    setTasks(p => {
      const currentDone = p[key].done;
      const maxCount = p[key].count === 0? 1 : p[key].count;
      const d = currentDone < maxCount? currentDone + 1 : 0;
      return {...p, [key]: {...p[key], done: d } };
    });
  };

  const isTaskDone = (task) => {
    return task.count === 0? task.done >= 1 : task.done >= task.count;
  };

  const allTasksDone = () => Object.values(tasks).every(isTaskDone);

  const completeDay = () => {
    if (!allTasksDone()) {
      Alert.alert(T.tasksNotDone, T.completeAllFirst);
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    setProfile(p => ({
      completedFaces: p.completedFaces + facesPerDay,
      totalDays: p.totalDays + 1,
      streak: p.lastDate === yesterday? p.streak + 1 : 1,
      lastDate: today
    }));
    setFace(f => Math.min(604, f + facesPerDay));
    resetToday();
    Alert.alert(T.mubarak, T.accepted);
  };

  const resetToday = () => setTasks(p => {
    const r = {};
    Object.keys(p).forEach(k => r[k] = {...p[k], done: 0 });
    return r;
  });

  const resetAll = () => Alert.alert(T.confirm, T.confirmReset, [
    { text: T.cancel, style: 'cancel' },
    {
      text: T.confirm, style: 'destructive', onPress: () => {
        setFace(1);
        setHours(12);
        setFacesPerDay(1);
        setRepeatCount(40);
        setCounter(0);
        setProfile({ completedFaces: 0, totalDays: 0, streak: 0, lastDate: '' });
        resetToday();
      }
    }
  ]);

  const TabIcon = ({ name, iconName, active }) => (
    <TouchableOpacity onPress={() => setTab(name)} style={styles.tab}>
      <Ionicons name={iconName} size={24} color={active? C.gold : C.gray} />
      <Text style={[styles.tabText, active && { color: C.gold }]}>{name}</Text>
    </TouchableOpacity>
  );

  const TaskItem = ({ taskKey, task, index }) => {
    const done = isTaskDone(task);
    const showCount = task.count > 0;
    const rabtRange = taskKey === 'rabt'? getRabtRange() : null;
    const murajaahRange = taskKey === 'murajaah'? getMurajaahRange() : null;

    return (
      <TouchableOpacity style={styles.task} onPress={() => updateTask(taskKey)}>
        <View style={styles.taskRight}>
          <View style={[styles.taskNum, done && styles.taskNumDone]}>
            <Text style={styles.taskNumText}>{index + 1}</Text>
          </View>
          <Ionicons name={task.icon} size={24} color={C.gold} style={{ marginHorizontal: 12 }} />
        </View>
        <View style={styles.taskCenter}>
          <Text style={styles.taskText}>
            {task.name}{showCount && `: ${task.count} ${task.count > 1? T.times : T.time}`}
          </Text>
          {taskKey === 'yesterday' && <Text style={styles.taskSub}>{T.face} {Math.max(1, face - 2)} - {Math.max(1, face - 1)}</Text>}
          {taskKey === 'rabt' && rabtRange && <Text style={styles.taskSub}>{T.fromFace} {rabtRange}</Text>}
          {taskKey === 'murajaah' && murajaahRange && <Text style={styles.taskSub}>{T.fromFace} {murajaahRange}</Text>}
        </View>
        <View style={[styles.checkbox, done && styles.checkboxDone]}>
          {done && <Ionicons name="checkmark" size={20} color={C.green} />}
        </View>
        {showCount && <Text style={styles.taskCount}>{task.done}/{task.count}</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        {tab === T.home && (
          <View>
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <TouchableOpacity onPress={resetToday}>
                  <Ionicons name="refresh" size={28} color={C.gold} />
                </TouchableOpacity>
                <Text style={styles.title}>{T.todayPlan}</Text>
                <Ionicons name="book" size={28} color={C.gold} />
              </View>
              <View style={styles.infoRow}>
                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>اليوم:</Text>
                  <Text style={styles.infoValue}>{profile.totalDays}</Text>
                </View>
                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>رقم الوجه:</Text>
                  <Text style={styles.infoValue}>{T.face} {face} - {face + facesPerDay - 1}</Text>
                </View>
                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>السورة:</Text>
                  <Text style={styles.infoValue}>البقرة</Text>
                </View>
              </View>
            </View>
            <View style={styles.card}>
              {Object.entries(tasks).map(([key, task], index) => (
                <TaskItem key={key} taskKey={key} task={task} index={index} />
              ))}
              <TouchableOpacity
                style={[styles.btn,!allTasksDone() && styles.btnDisabled]}
                onPress={completeDay}
              >
                <Text style={styles.btnText}>* {T.done}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {tab === T.counter && (
          <View style={styles.center}>
            <Text style={styles.title}>{T.tasbeeh}</Text>
            <TouchableOpacity style={styles.counterCircle} onPress={() => setCounter(c => c + 1)}>
              <Text style={styles.counterNum}>{counter}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, { backgroundColor: C.red }]} onPress={() => setCounter(0)}>
              <Text style={styles.btnText}>{T.resetCounter}</Text>
            </TouchableOpacity>
          </View>
        )}

        {tab === T.change && (
          <View>
            <Text style={styles.title}>{T.changeTitle}</Text>

            <View style={styles.card}>
              <Text style={styles.label}>{T.currentFace}</Text>
              <View style={styles.row}>
                <TouchableOpacity onPress={() => setFace(f => Math.max(1, f - 1))} style={styles.smallBtn}>
                  <Text style={styles.btnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.value}>{face}</Text>
                <TouchableOpacity onPress={() => setFace(f => Math.min(604, f + 1))} style={styles.smallBtn}>
                  <Text style={styles.btnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>{T.dailyHours}</Text>
              <Text style={styles.subLabel}>{T.hoursAvailable}</Text>
              <View style={styles.row}>
                <TouchableOpacity onPress={() => setHours(h => Math.max(1, h - 1))} style={styles.smallBtn}>
                  <Text style={styles.btnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.value}>{hours} {T.hour}</Text>
                <TouchableOpacity onPress={() => setHours(h => h + 1)} style={styles.smallBtn}>
                  <Text style={styles.btnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>{T.dailyAmount}</Text>
              <Text style={styles.subLabel}>{T.facesDaily}</Text>
              <View style={styles.row}>
                <TouchableOpacity onPress={() => setFacesPerDay(f => Math.max(1, f - 1))} style={styles.smallBtn}>
                  <Text style={styles.btnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.value}>{facesPerDay} {T.faceUnit}</Text>
                <TouchableOpacity onPress={() => setFacesPerDay(f => f + 1)} style={styles.smallBtn}>
                  <Text style={styles.btnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>{T.repeatCount}</Text>
              <Text style={styles.subLabel}>{T.repeatRange}</Text>
              <View style={styles.row}>
                <TouchableOpacity onPress={() => setRepeatCount(r => Math.max(20, r - 5))} style={styles.smallBtn}>
                  <Text style={styles.btnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.value}>{repeatCount} {T.repeatUnit}</Text>
                <TouchableOpacity onPress={() => setRepeatCount(r => Math.min(50, r + 5))} style={styles.smallBtn}>
                  <Text style={styles.btnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {tab === T.profile && (
          <View>
            <View style={styles.header}>
              <Ionicons name="person-circle" size={80} color={C.gold} />
              <Text style={styles.title}>{T.hafiz}</Text>
              <Text style={styles.subtitle}>{T.journey}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{T.progress}</Text>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>{T.totalDone}</Text>
                <Text style={styles.statValue}>{profile.completedFaces} {T.from} 604</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(profile.completedFaces / 604) * 100}%` }]} />
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>{T.totalDays}</Text>
                <Text style={styles.statValue}>{profile.totalDays}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>{T.streak}</Text>
                <Text style={styles.statValue}>{profile.streak}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>{T.lastDone}</Text>
                <Text style={styles.statValue}>{profile.lastDate || T.none}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>{T.currentFaceLabel}</Text>
                <Text style={styles.statValue}>{face}</Text>
              </View>
            </View>
          </View>
        )}

        {tab === T.more && (
          <View>
            <Text style={styles.title}>{T.more}</Text>
            <View style={styles.card}>
              <TouchableOpacity style={styles.menuItem}>
                <Ionicons name="cloud-upload-outline" size={24} color={C.gold} />
                <Text style={styles.menuText}>{T.sync}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={resetToday}>
                <Ionicons name="refresh" size={24} color={C.gold} />
                <Text style={styles.menuText}>{T.resetToday}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={resetAll}>
                <Ionicons name="trash" size={24} color={C.red} />
                <Text style={[styles.menuText, { color: C.red }]}>{T.resetAll}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{T.about}</Text>
              <Text style={styles.aboutText}>{T.version}</Text>
              <Text style={styles.aboutText}>{T.intention}</Text>
              <Text style={styles.footer}>{T.footer}</Text>
            </View>
          </View>
        )}

      </ScrollView>

      <View style={styles.tabBar}>
        <TabIcon name={T.change} iconName="settings" active={tab === T.change} />
        <TabIcon name={T.counter} iconName="radio-button-on" active={tab === T.counter} />
        <TabIcon name={T.home} iconName="home" active={tab === T.home} />
        <TabIcon name={T.profile} iconName="person" active={tab === T.profile} />
        <TabIcon name={T.more} iconName="menu" active={tab === T.more} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { flex: 1, padding: 16 },
  header: { marginBottom: 20 },
  headerTop: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: C.text, textAlign: 'center', flex: 1 },
  subtitle: { fontSize: 18, color: C.gold, textAlign: 'center' },
  infoRow: { flexDirection: 'row-reverse', justifyContent: 'space-around', backgroundColor: C.card, borderRadius: 12, padding: 12 },
  infoBox: { alignItems: 'center' },
  infoLabel: { fontSize: 12, color: C.gray, marginBottom: 4 },
  infoValue: { fontSize: 16, color: C.gold, fontWeight: 'bold' },
  card: { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: C.gold, marginBottom: 16, textAlign: 'center' },
  task: { flexDirection: 'row-reverse', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.bg },
  taskRight: { flexDirection: 'row-reverse', alignItems: 'center' },
  taskNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.gold, justifyContent: 'center', alignItems: 'center' },
  taskNumDone: { backgroundColor: C.green },
  taskNumText: { color: C.bg, fontWeight: 'bold', fontSize: 16 },
  taskCenter: { flex: 1, marginHorizontal: 8 },
  taskText: { fontSize: 16, color: C.text, textAlign: 'right' },
  taskSub: { fontSize: 12, color: C.gray, textAlign: 'right', marginTop: 2 },
  checkbox: { width: 28, height: 28, borderRadius: 6, borderWidth: 2, borderColor: C.gray, marginLeft: 8, justifyContent: 'center', alignItems: 'center' },
  checkboxDone: { borderColor: C.green, backgroundColor: C.green + '20' },
  taskCount: { fontSize: 14, color: C.gray, marginLeft: 8, minWidth: 40, textAlign: 'center' },
  btn: { backgroundColor: C.gold, padding: 16, borderRadius: 12, marginTop: 16 },
  btnDisabled: { backgroundColor: C.gray, opacity: 0.5 },
  btnText: { color: C.bg, fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  center: { alignItems: 'center', marginTop: 40 },
  counterCircle: { width: 200, height: 200, borderRadius: 100, backgroundColor: C.card, justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: C.gold, marginVertical: 30 },
  counterNum: { fontSize: 64, fontWeight: 'bold', color: C.gold },
  label: { fontSize: 18, color: C.text, marginBottom: 4, textAlign: 'right' },
  subLabel: { fontSize: 14, color: C.gray, marginBottom: 12, textAlign: 'right' },
  row: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center' },
  smallBtn: { backgroundColor: C.gold, width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  value: { fontSize: 24, fontWeight: 'bold', color: C.text, marginHorizontal: 20, minWidth: 100, textAlign: 'center' },
  statRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.bg },
  statLabel: { fontSize: 16, color: C.gray },
  statValue: { fontSize: 16, color: C.text, fontWeight: 'bold' },
  progressBar: { height: 8, backgroundColor: C.bg, borderRadius: 4, marginVertical: 12, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: C.gold },
  menuItem: { flexDirection: 'row-reverse', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: C.bg },
  menuText: { fontSize: 16, color: C.text, marginRight: 12, flex: 1, textAlign: 'right' },
  aboutText: { fontSize: 14, color: C.gray, textAlign: 'center', marginVertical: 4 },
  footer: { fontSize: 14, color: C.gold, textAlign: 'center', marginTop: 16 },
  tabBar: { flexDirection: 'row-reverse', backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.bg, paddingVertical: 8, position: 'absolute', bottom: 0, left: 0, right: 0 },
  tab: { flex: 1, alignItems: 'center' },
  tabText: { fontSize: 12, color: C.gray, marginTop: 4 },
});
