package cache

import (
  "sync"
  "time"
)

type CacheItem struct {
  Value      interface{}
  Expiration int64
}

type Cache struct {
  items map[string]CacheItem
  mu    sync.RWMutex
}

func New() *Cache {
  cache := &Cache{
    items: make(map[string]CacheItem),
  }
  
  // Start the janitor to clean expired items
  go cache.janitor()
  
  return cache
}

func (c *Cache) Set(key string, value interface{}, duration time.Duration) {
  c.mu.Lock()
  defer c.mu.Unlock()
  
  expiration := time.Now().Add(duration).UnixNano()
  c.items[key] = CacheItem{
    Value:      value,
    Expiration: expiration,
  }
}

func (c *Cache) Get(key string) (interface{}, bool) {
  c.mu.RLock()
  defer c.mu.RUnlock()
  
  item, found := c.items[key]
  if !found {
    return nil, false
  }
  
  // Check if the item has expired
  if time.Now().UnixNano() > item.Expiration {
    return nil, false
  }
  
  return item.Value, true
}

func (c *Cache) Delete(key string) {
  c.mu.Lock()
  defer c.mu.Unlock()
  
  delete(c.items, key)
}

func (c *Cache) janitor() {
  ticker := time.NewTicker(5 * time.Minute)
  defer ticker.Stop()
  
  for {
    <-ticker.C
    c.deleteExpired()
  }
}

func (c *Cache) deleteExpired() {
  now := time.Now().UnixNano()
  
  c.mu.Lock()
  defer c.mu.Unlock()
  
  for key, item := range c.items {
    if now > item.Expiration {
      delete(c.items, key)
    }
  }
}
