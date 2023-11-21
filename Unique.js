function getEntriesWithUniqueThreads(data) {
    
    //[ { id: '18bf2a1e76a9830a', threadId: '18bf2a1e76a9830a' } ]
      const threadIdCount = new Map();
      const uniqueData = [];
    
      for (const item of data) {
        const { id, threadId } = item;
        const count = threadIdCount.get(threadId) || 0;
        threadIdCount.set(threadId, count + 1);
      }
    
      for (const item of data) {
        const { id, threadId } = item;
        if (threadIdCount.get(threadId) === 1) {
          uniqueData.push(item);
        }
      }
    
      return uniqueData;
    }

export default getEntriesWithUniqueThreads;