import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import { requestError } from '../contexts/CustomerDataContext';
import { idOf, record, RecordData } from '../services/customer-data';
import { COLORS, TYPOGRAPHY, SPACING, RADII, SHADOWS } from '../theme';
import { Button, Badge, Card, Avatar, SearchBar } from '../components/ui';

interface SupportScreenProps {
  navigation?: {
    goBack: () => void;
  };
}

interface HelpTopic {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
  categoryKey: string;
}

const POPULAR_TOPICS: HelpTopic[] = [
  {
    id: 'topic_1',
    title: 'Booking & Service',
    icon: 'calendar-outline',
    color: '#DC2626',
    bg: '#FEE2E2',
    categoryKey: 'BOOKING',
  },
  {
    id: 'topic_2',
    title: 'Payments & Refunds',
    icon: 'card-outline',
    color: '#2563EB',
    bg: '#DBEAFE',
    categoryKey: 'PAYMENT',
  },
  {
    id: 'topic_3',
    title: 'Emergency Assistance',
    icon: 'flash-outline',
    color: '#EA580C',
    bg: '#FFEDD5',
    categoryKey: 'EMERGENCY',
  },
  {
    id: 'topic_4',
    title: 'Used Cars',
    icon: 'car-sport-outline',
    color: '#059669',
    bg: '#D1FAE5',
    categoryKey: 'USED_CARS',
  },
  {
    id: 'topic_5',
    title: 'Spare Parts',
    icon: 'construct-outline',
    color: '#7C3AED',
    bg: '#EDE9FE',
    categoryKey: 'SPARE_PARTS',
  },
  {
    id: 'topic_6',
    title: 'Account & Settings',
    icon: 'settings-outline',
    color: '#4B5563',
    bg: '#F3F4F6',
    categoryKey: 'ACCOUNT',
  },
];

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  categoryKey?: string;
}

const FAQS: FAQItem[] = [
  {
    id: 'faq_1',
    question: 'How do I track my assigned mechanic in real-time?',
    answer:
      'Once your booking is confirmed and a mechanic is en route, tap on your active booking card or navigate to Bookings > Live Tracking to view your mechanic’s real-time GPS location and estimated arrival time.',
    categoryKey: 'BOOKING',
  },
  {
    id: 'faq_2',
    question: 'What is included in the Periodic Maintenance Service?',
    answer:
      'Our Periodic Maintenance includes high-grade synthetic engine oil replacement, oil filter change, air and cabin AC filter cleaning, coolant and brake fluid top-up, plus a thorough 40-point vehicle health scan.',
    categoryKey: 'BOOKING',
  },
  {
    id: 'faq_3',
    question: 'Can I reschedule or cancel my service booking?',
    answer:
      'Yes, you can reschedule or cancel free of charge up to 2 hours before the scheduled time slot. Simply open the booking details and tap "Cancel Booking" or call support.',
    categoryKey: 'BOOKING',
  },
  {
    id: 'faq_4',
    question: 'How does Auto Pro 24/7 doorstep emergency assistance work?',
    answer:
      'Hit the "Emergency SOS" button on your home screen. Our nearby mobile workshop mechanic will be dispatched immediately for jump starts, flat tyre puncture repairs, towing, or emergency fuel.',
    categoryKey: 'EMERGENCY',
  },
  {
    id: 'faq_5',
    question: 'Are genuine OEM spare parts used with warranty?',
    answer:
      'Every spare part and consumable installed by Auto Pro is 100% genuine OEM/OES sourced from Bosch, Brembo, Mobil, and certified manufacturers, backed by a 6-month or 10,000 km warranty.',
    categoryKey: 'SPARE_PARTS',
  },
];

export const SupportScreen: React.FC<SupportScreenProps> = ({ navigation }) => {
  const { isPreview, user } = useAuth();

  const [activeTab, setActiveTab] = useState<'help' | 'tickets'>('help');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  // Tickets state
  const [tickets, setTickets] = useState<RecordData[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<RecordData | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Ticket creation modal
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [ticketCategory, setTicketCategory] = useState('GENERAL');

  // Chat message state
  const [replyMessage, setReplyMessage] = useState('');

  const loadTickets = async () => {
    if (isPreview) {
      if (tickets.length === 0) {
        setTickets([
          {
            id: 'tkt-1082',
            subject: 'Question about brake pad replacement warranty',
            status: 'OPEN',
            category: 'SPARE_PARTS',
            description: 'I recently booked a front brake pad replacement. Is there an official invoice and warranty card provided?',
            createdAt: new Date().toISOString(),
            messages: [
              {
                id: 'msg_1',
                sender: 'customer',
                message: 'I recently booked a front brake pad replacement. Is there an official invoice and warranty card provided?',
                time: '10:30 AM',
              },
              {
                id: 'msg_2',
                sender: 'support',
                senderName: 'Arun Patil',
                message: 'Hello! Yes, all Brembo brake pads come with a digital 6-month warranty card accessible directly in your Orders tab.',
                time: '10:34 AM',
              },
            ],
          },
        ]);
      }
      return;
    }

    setBusy(true);
    setError('');
    try {
      const response = await api.get('/support');
      if (!Array.isArray(response.data.data)) throw new Error('Invalid ticket response.');
      setTickets(response.data.data);
    } catch (err) {
      setError(requestError(err));
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    void loadTickets();
  }, [isPreview]);

  const handleCreateTicket = async () => {
    if (!subject.trim() || !description.trim()) {
      Alert.alert('Missing Information', 'Please provide both a subject and details of your request.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      let createdTicket: RecordData;
      if (isPreview) {
        createdTicket = {
          id: `preview-ticket-${Date.now()}`,
          subject: subject.trim(),
          status: 'OPEN',
          category: ticketCategory,
          description: description.trim(),
          createdAt: new Date().toISOString(),
          messages: [
            {
              id: `msg-${Date.now()}`,
              sender: 'customer',
              message: description.trim(),
              time: 'Just now',
            },
          ],
        };
      } else {
        const res = await api.post('/support', {
          subject: subject.trim(),
          description: description.trim(),
          category: ticketCategory,
        });
        createdTicket = record(res.data.data);
      }

      setTickets((prev) => [createdTicket, ...prev]);
      setSubject('');
      setDescription('');
      setCreateModalVisible(false);
      setSelectedTicket(createdTicket);
    } catch (err) {
      setError(requestError(err));
      Alert.alert('Failed to Create Ticket', requestError(err));
    } finally {
      setBusy(false);
    }
  };

  const openTicketDetail = async (ticket: RecordData) => {
    setBusy(true);
    setError('');
    try {
      if (isPreview) {
        setSelectedTicket(ticket);
      } else {
        const res = await api.get(`/support/${idOf(ticket)}`);
        setSelectedTicket(record(res.data.data));
      }
    } catch (err) {
      setError(requestError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || busy || !replyMessage.trim()) return;

    setBusy(true);
    setError('');
    try {
      const trimmed = replyMessage.trim();
      let updatedTicket: RecordData;

      if (isPreview) {
        const existingMessages = Array.isArray(selectedTicket.messages) ? selectedTicket.messages : [];
        const newMsg = {
          id: `msg-${Date.now()}`,
          sender: 'customer',
          message: trimmed,
          time: 'Just now',
        };
        updatedTicket = {
          ...selectedTicket,
          messages: [...existingMessages, newMsg],
        };
      } else {
        const res = await api.post(`/support/${idOf(selectedTicket)}/messages`, { message: trimmed });
        updatedTicket = record(res.data.data);
      }

      setSelectedTicket(updatedTicket);
      setTickets((prev) => prev.map((t) => (idOf(t) === idOf(updatedTicket) ? updatedTicket : t)));
      setReplyMessage('');
    } catch (err) {
      setError(requestError(err));
    } finally {
      setBusy(false);
    }
  };

  // Filter FAQs based on search and selected topic
  const filteredFaqs = useMemo(() => {
    return FAQS.filter((faq) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTopic =
        !selectedTopic || faq.categoryKey === selectedTopic;

      return matchesSearch && matchesTopic;
    });
  }, [searchQuery, selectedTopic]);

  // If a ticket is selected, show Ticket Detail + Chat view (Screen #28)
  if (selectedTicket) {
    const rawMessages = Array.isArray(selectedTicket.messages) ? selectedTicket.messages : [];
    const ticketId = idOf(selectedTicket);
    const displayTicketId = ticketId.startsWith('preview-') ? 'TKT-1082' : `TKT-${ticketId.slice(-6).toUpperCase()}`;
    const statusText = String(selectedTicket.status || 'OPEN').toUpperCase();

    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

        {/* Chat Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedTicket(null)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: SPACING.xs }}>
            <Text style={styles.headerTitle}>{String(selectedTicket.subject || 'Support Ticket')}</Text>
            <Text style={styles.headerSubtitle}>
              Ticket #{displayTicketId} • {new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
            </Text>
          </View>
          <Badge
            text={statusText}
            variant={statusText === 'RESOLVED' ? 'success' : 'error'}
            size="sm"
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.chatScrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Support Specialist Status Card Inline */}
          <Card style={styles.specialistCard} elevation="sm" border>
            <View style={styles.specialistRow}>
              <Avatar
                name="Arun Patil"
                size={42}
                status="online"
                backgroundColor="#FEE2E2"
                textColor={COLORS.primary}
              />
              <View style={styles.specialistInfo}>
                <View style={styles.rowAlign}>
                  <Text style={styles.specialistName}>Auto Pro Care Specialist</Text>
                  <Ionicons name="checkmark-circle" size={15} color={COLORS.success} style={{ marginLeft: 4 }} />
                </View>
                <Text style={styles.specialistSub}>Arun Patil • TVS Auto Pro Helpdesk</Text>
              </View>
            </View>
            <Text style={styles.specialistNote}>
              Our priority support executive is actively reviewing your request. Average response time is under 5 minutes.
            </Text>
          </Card>

          {/* Ticket Description as first bubble */}
          {selectedTicket.description ? (
            <View style={styles.customerBubbleWrapper}>
              <View style={styles.customerBubble}>
                <Text style={styles.customerBubbleText}>{String(selectedTicket.description)}</Text>
              </View>
              <Text style={styles.timestampCustomer}>Initial Request</Text>
            </View>
          ) : null}

          {/* Messages */}
          {rawMessages.map((item, index) => {
            const msgObj = record(item);
            const msgText = String(msgObj.message || '');
            const isUser = msgObj.sender === 'customer' || !msgObj.sender;

            return (
              <View
                key={index}
                style={isUser ? styles.customerBubbleWrapper : styles.agentBubbleWrapper}
              >
                {!isUser && (
                  <View style={styles.agentHeaderRow}>
                    <Avatar name={String(msgObj.senderName || 'Auto Pro')} size={20} />
                    <Text style={styles.agentSenderName}>
                      {String(msgObj.senderName || 'Support Agent')}
                    </Text>
                  </View>
                )}
                <View style={isUser ? styles.customerBubble : styles.agentBubble}>
                  <Text style={isUser ? styles.customerBubbleText : styles.agentBubbleText}>
                    {msgText}
                  </Text>
                </View>
                <Text style={isUser ? styles.timestampCustomer : styles.timestampAgent}>
                  {String(msgObj.time || 'Today')}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        {/* Reply Bar */}
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.replyBar}>
            <TextInput
              style={styles.replyInput}
              placeholder="Type your message..."
              placeholderTextColor={COLORS.textMuted}
              value={replyMessage}
              onChangeText={setReplyMessage}
              multiline
              maxLength={2000}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                (!replyMessage.trim() || busy) && styles.sendBtnDisabled,
              ]}
              onPress={handleSendReply}
              disabled={!replyMessage.trim() || busy}
              activeOpacity={0.7}
            >
              <Ionicons name="send" size={18} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Default Support Center View (Screen #27)
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {navigation?.goBack && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>Support Center</Text>
        </View>

        {/* View tickets tab toggle badge */}
        <TouchableOpacity
          style={styles.ticketsBadgeBtn}
          onPress={() => setActiveTab((prev) => (prev === 'help' ? 'tickets' : 'help'))}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'help' ? 'chatbubble-ellipses-outline' : 'help-circle-outline'}
            size={16}
            color={COLORS.primary}
          />
          <Text style={styles.ticketsBadgeText}>
            {activeTab === 'help' ? `My Tickets (${tickets.length})` : 'Help Center'}
          </Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={16} color={COLORS.error} />
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      ) : null}

      {activeTab === 'tickets' ? (
        /* Tickets List View */
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Your Support Tickets</Text>
            <TouchableOpacity onPress={() => setCreateModalVisible(true)}>
              <Text style={styles.linkText}>+ New Ticket</Text>
            </TouchableOpacity>
          </View>

          {tickets.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="chatbubbles-outline" size={44} color={COLORS.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>No Active Tickets</Text>
              <Text style={styles.emptySubtitle}>
                Have a question or facing an issue? Raise a ticket and our customer support team will assist you immediately.
              </Text>
              <Button
                title="Create a Ticket"
                variant="primary"
                size="md"
                onPress={() => setCreateModalVisible(true)}
                style={{ marginTop: SPACING.lg }}
              />
            </View>
          ) : (
            <View style={styles.ticketsList}>
              {tickets.map((ticket) => {
                const tId = idOf(ticket);
                const displayId = tId.startsWith('preview-') ? 'TKT-1082' : `TKT-${tId.slice(-6).toUpperCase()}`;
                const status = String(ticket.status || 'OPEN').toUpperCase();
                return (
                  <Card
                    key={tId}
                    style={styles.ticketCard}
                    onPress={() => openTicketDetail(ticket)}
                    elevation="sm"
                    border
                  >
                    <View style={styles.ticketHeader}>
                      <Text style={styles.ticketIdText}>#{displayId}</Text>
                      <Badge
                        text={status}
                        variant={status === 'RESOLVED' ? 'success' : 'error'}
                        size="sm"
                      />
                    </View>
                    <Text style={styles.ticketSubject} numberOfLines={2}>
                      {String(ticket.subject)}
                    </Text>
                    {ticket.description ? (
                      <Text style={styles.ticketSnippet} numberOfLines={2}>
                        {String(ticket.description)}
                      </Text>
                    ) : null}
                    <View style={styles.ticketFooter}>
                      <Text style={styles.ticketDate}>Tap to open conversation</Text>
                      <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
                    </View>
                  </Card>
                );
              })}
            </View>
          )}
        </ScrollView>
      ) : (
        /* Help Center View */
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Search Bar at Top */}
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search FAQs, topics & help..."
            onClear={() => setSearchQuery('')}
            style={styles.searchBar}
          />

          {/* Popular Help Topics 2x3 Grid */}
          <View style={styles.topicsSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Popular Help Topics</Text>
              {selectedTopic && (
                <TouchableOpacity onPress={() => setSelectedTopic(null)}>
                  <Text style={styles.linkText}>Show All</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.topicsGrid}>
              {POPULAR_TOPICS.map((topic) => {
                const isSelected = selectedTopic === topic.categoryKey;
                return (
                  <TouchableOpacity
                    key={topic.id}
                    style={[
                      styles.topicCard,
                      isSelected && styles.topicCardSelected,
                    ]}
                    onPress={() => {
                      setSelectedTopic((prev) => (prev === topic.categoryKey ? null : topic.categoryKey));
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.topicIconContainer, { backgroundColor: topic.bg }]}>
                      <Ionicons name={topic.icon} size={22} color={topic.color} />
                    </View>
                    <Text style={[styles.topicTitle, isSelected && styles.topicTitleSelected]}>
                      {topic.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Frequently Asked Questions */}
          <View style={styles.faqsSection}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            <View style={styles.faqsList}>
              {filteredFaqs.length === 0 ? (
                <Text style={styles.noFaqsText}>
                  No matching FAQs found. Try a different keyword or contact our support team.
                </Text>
              ) : (
                filteredFaqs.map((faq) => {
                  const isExpanded = expandedFaqId === faq.id;
                  return (
                    <Card
                      key={faq.id}
                      style={styles.faqCard}
                      onPress={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                      elevation="none"
                      border
                    >
                      <View style={styles.faqHeader}>
                        <Text style={styles.faqQuestion}>{faq.question}</Text>
                        <Ionicons
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={18}
                          color={COLORS.textSecondary}
                        />
                      </View>
                      {isExpanded && (
                        <Text style={styles.faqAnswer}>{faq.answer}</Text>
                      )}
                    </Card>
                  );
                })
              )}
            </View>
          </View>

          {/* Contact Support Red CTA Button */}
          <View style={styles.ctaContainer}>
            <Button
              title="Contact Support"
              icon="headset-outline"
              variant="primary"
              size="lg"
              fullWidth
              onPress={() => setCreateModalVisible(true)}
            />
          </View>
        </ScrollView>
      )}

      {/* Create Ticket Modal */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Contact Support</Text>
              <TouchableOpacity
                onPress={() => setCreateModalVisible(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={22} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalBody}>
              <Text style={styles.inputLabel}>Subject *</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="Brief summary of your query or issue"
                placeholderTextColor={COLORS.textMuted}
                value={subject}
                onChangeText={setSubject}
                maxLength={150}
              />

              <Text style={[styles.inputLabel, { marginTop: SPACING.md }]}>Category</Text>
              <View style={styles.categoryPillsRow}>
                {['GENERAL', 'BOOKING', 'PAYMENT', 'EMERGENCY'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryPill,
                      ticketCategory === cat && styles.categoryPillSelected,
                    ]}
                    onPress={() => setTicketCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryPillText,
                        ticketCategory === cat && styles.categoryPillTextSelected,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.inputLabel, { marginTop: SPACING.md }]}>Detailed Description *</Text>
              <TextInput
                style={[styles.modalTextInput, styles.modalTextArea]}
                placeholder="Explain the problem or question in detail..."
                placeholderTextColor={COLORS.textMuted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                maxLength={2000}
              />

              <View style={{ marginTop: SPACING.lg }}>
                <Button
                  title={busy ? 'Submitting...' : 'Submit Support Request'}
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={busy}
                  onPress={handleCreateTicket}
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: SPACING.sm,
    padding: SPACING.xs,
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  ticketsBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADII.full,
  },
  ticketsBadgeText: {
    ...TYPOGRAPHY.labelSmall,
    color: COLORS.primary,
    marginLeft: 4,
    fontWeight: '700',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.errorLight,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  errorBannerText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.error,
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING['3xl'],
  },
  searchBar: {
    marginBottom: SPACING.lg,
  },
  topicsSection: {
    marginBottom: SPACING.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
  },
  linkText: {
    ...TYPOGRAPHY.label,
    color: COLORS.primary,
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  topicCard: {
    width: '48.5%',
    backgroundColor: COLORS.white,
    borderRadius: RADII.md,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  topicCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFF5F5',
  },
  topicIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  topicTitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
  topicTitleSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  faqsSection: {
    marginBottom: SPACING.xl,
  },
  faqsList: {
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  faqCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADII.md,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    ...TYPOGRAPHY.bodySemibold,
    color: COLORS.textPrimary,
    flex: 1,
    paddingRight: SPACING.sm,
  },
  faqAnswer: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginTop: SPACING.sm,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  noFaqsText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    paddingVertical: SPACING.md,
  },
  ctaContainer: {
    marginTop: SPACING.sm,
  },

  // Tickets List
  ticketsList: {
    gap: SPACING.md,
  },
  ticketCard: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  ticketIdText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  ticketSubject: {
    ...TYPOGRAPHY.bodySemibold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  ticketSnippet: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  ticketFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  ticketDate: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING['3xl'],
    paddingHorizontal: SPACING.xl,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Chat View
  chatScrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING['3xl'],
  },
  specialistCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADII.md,
    marginBottom: SPACING.lg,
  },
  specialistRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specialistInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  rowAlign: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specialistName: {
    ...TYPOGRAPHY.bodySemibold,
    color: COLORS.textPrimary,
  },
  specialistSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  specialistNote: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    lineHeight: 16,
    marginTop: SPACING.sm,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  customerBubbleWrapper: {
    alignSelf: 'flex-end',
    maxWidth: '82%',
    marginBottom: SPACING.md,
    alignItems: 'flex-end',
  },
  customerBubble: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: RADII.md,
    borderBottomRightRadius: 2,
  },
  customerBubbleText: {
    ...TYPOGRAPHY.body,
    color: COLORS.white,
    lineHeight: 20,
  },
  agentBubbleWrapper: {
    alignSelf: 'flex-start',
    maxWidth: '82%',
    marginBottom: SPACING.md,
  },
  agentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  agentSenderName: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  agentBubble: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: RADII.md,
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  agentBubbleText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  timestampCustomer: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  timestampAgent: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  replyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  replyInput: {
    flex: 1,
    backgroundColor: COLORS.gray100,
    borderRadius: RADII.full,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 10,
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    maxHeight: 100,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADII.xl,
    borderTopRightRadius: RADII.xl,
    maxHeight: '85%',
    paddingBottom: SPACING.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  modalTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
  },
  modalBody: {
    padding: SPACING.xl,
  },
  inputLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  modalTextInput: {
    backgroundColor: COLORS.gray50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
  },
  modalTextArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  categoryPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADII.full,
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryPillSelected: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  categoryPillText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  categoryPillTextSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
