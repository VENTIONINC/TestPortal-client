import { useState } from 'react';
import { Box, Container, Heading, Text, Flex, Input, Button, Spinner } from '@chakra-ui/react';

import { AppHeader } from '@/components/AppHeader';
import { useGetApiChatStatusQuery, usePostApiChatMutation } from '@/redux/apis/mcp-api/extended';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export function MCPPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'system',
      content: 'Connected to MCP Server. You can now send commands and queries.',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');

  const [postApiChat, { isLoading }] = usePostApiChatMutation();
  const { data: chatStatus, isLoading: isChatStatusLoading } = useGetApiChatStatusQuery();

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    const messageToSend = inputValue;
    setInputValue('');

    try {
      const response = await postApiChat({
        body: { messages: [{ role: 'user', content: messageToSend }] },
      }).unwrap();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.conversation?.at(-1)?.content ?? '',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev.filter((msg) => msg.id !== newMessage.id), newMessage, assistantMessage]);
    } catch {
      setMessages((prev) => prev.filter((msg) => msg.id !== newMessage.id));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageBgColor = (type: string) => {
    switch (type) {
      case 'user':
        return 'blue.100';
      case 'assistant':
        return 'gray.100';
      case 'system':
        return 'green.100';
      default:
        return 'gray.50';
    }
  };

  const getMessageAlignment = (type: string) => {
    return type === 'user' ? 'flex-end' : 'flex-start';
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <AppHeader />
      <Box bg="white" shadow="sm" borderBottom="1px" borderColor="gray.200" px={6} py={4}>
        <Container maxW="6xl">
          <Flex align="center" justify="space-between">
            <Box>
              <Heading size="lg">MCP Chat</Heading>
              <Text color="gray.600" fontSize="sm">
                Model Context Protocol Client
              </Text>
            </Box>
            <Flex align="center" gap={2}>
              {isChatStatusLoading && <Spinner size="sm" />}
              <Box px={3} py={1} bg="green.100" color="green.800" borderRadius="full" fontSize="sm">
                {chatStatus?.ready ? 'Connected' : 'Disconnected'}
              </Box>
            </Flex>
          </Flex>
        </Container>
      </Box>

      <Container maxW="6xl" h="calc(100vh - 200px)">
        <Flex direction="column" h="100%">
          <Box
            flex="1"
            overflowY="auto"
            p={4}
            css={{
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-track': {
                width: '6px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#cbd5e0',
                borderRadius: '24px',
              },
            }}
          >
            {messages.map((message) => (
              <Flex key={message.id} justify={getMessageAlignment(message.type)} mb={4}>
                <Box
                  maxW="70%"
                  bg={getMessageBgColor(message.type)}
                  px={4}
                  py={3}
                  borderRadius="lg"
                  border="1px"
                  borderColor="gray.200"
                >
                  <Text fontSize="sm" color="gray.600" mb={1}>
                    {message.type === 'user' ? 'You' : message.type === 'assistant' ? 'MCP Server' : 'System'}
                  </Text>
                  <Text>{message.content}</Text>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    {message.timestamp.toLocaleTimeString()}
                  </Text>
                </Box>
              </Flex>
            ))}
          </Box>

          <Box p={4} bg="white" borderTop="1px" borderColor="gray.200">
            <Flex gap={2}>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your MCP command or query..."
                size="lg"
                flex="1"
              />
              <Button
                onClick={handleSendMessage}
                colorScheme="blue"
                size="lg"
                disabled={!inputValue.trim() || isLoading}
              >
                Send
              </Button>
            </Flex>
            <Text fontSize="xs" color="gray.500" mt={2}>
              Press Enter to send • Shift+Enter for new line
            </Text>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}
