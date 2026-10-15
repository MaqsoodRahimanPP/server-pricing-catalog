import {
  DSANodeKnowledge,
  DSANodeType,
  ChaosScenario,
  ChaosScenarioId,
  ChaosSimulationResult
} from "../types";

export const DSA_SYSTEM_DESIGN_MAP: Record<DSANodeType, DSANodeKnowledge> = {
  cdn: {
    nodeType: "cdn",
    title: "Edge CDN & Anycast Routing",
    category: "Edge & Networking",
    primaryRole: "Terminate TLS at edge PoP, absorb static read traffic, and route requests via BGP Anycast to nearest server.",
    dsa: {
      coreDataStructures: [
        "Consistent Hashing Ring (Distributed cache placement without hot spots)",
        "Trie / Radix Tree (Fast URL prefix matching and routing rules)",
        "Bloom Filter (Probabilistic cache presence check in O(k) time)",
        "LRU / LFU Eviction (Doubly Linked List + Hash Map in O(1))"
      ],
      algorithms: [
        {
          name: "Consistent Hashing Ring with Virtual Nodes",
          complexity: { time: "O(log V) lookup", space: "O(N * V) where V = virtual nodes" },
          description: "Distributes edge URLs around a 2^32 integer ring. Hash(URL) finds the next clockwise node. Virtual nodes balance skew.",
          whyUsedInCloud: "When a CDN edge PoP fails or scales up, only K/N cache items migrate, preventing cache stampedes."
        },
        {
          name: "Bloom Filter Membership Check",
          complexity: { time: "O(k) hash ops", space: "O(m) bit array" },
          description: "Bit array using k independent hash functions. Guarantees 0% false negatives for checking if asset is in SSD cache.",
          whyUsedInCloud: "Avoids costly NVMe/SSTable disk reads for non-existent or cold assets at the edge."
        },
        {
          name: "LRU Cache Eviction",
          complexity: { time: "O(1) get/put", space: "O(Capacity)" },
          description: "Hash Map for O(1) key-to-node pointer lookup combined with Doubly Linked List for O(1) recency eviction.",
          whyUsedInCloud: "Manages edge memory and NVMe buffers by discarding least recently requested media."
        }
      ],
      codeSnippets: {
        typescript: `// TypeScript: Consistent Hash Ring with Virtual Nodes
class ConsistentHashRing {
  private ring: Map<number, string> = new Map();
  private sortedKeys: number[] = [];

  constructor(private replicas: number = 100) {}

  private hash(key: string): number {
    let hash = 0x811c9dc5;
    for (let i = 0; i < key.length; i++) {
      hash ^= key.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
  }

  addNode(node: string) {
    for (let i = 0; i < this.replicas; i++) {
      const vnodeKey = this.hash(\`\${node}#vnode\${i}\`);
      this.ring.set(vnodeKey, node);
      this.sortedKeys.push(vnodeKey);
    }
    this.sortedKeys.sort((a, b) => a - b);
  }

  getNode(key: string): string | null {
    if (this.sortedKeys.length === 0) return null;
    const hash = this.hash(key);
    // Binary search for first ring position >= hash
    let low = 0, high = this.sortedKeys.length - 1;
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (this.sortedKeys[mid] >= hash) high = mid;
      else low = mid + 1;
    }
    const idx = this.sortedKeys[low] >= hash ? low : 0;
    return this.ring.get(this.sortedKeys[idx]) || null;
  }
}`,
        python: `# Python 3: Consistent Hash Ring with Virtual Nodes
import bisect
import hashlib

class ConsistentHashRing:
    def __init__(self, replicas=100):
        self.replicas = replicas
        self.ring = {}
        self.sorted_keys = []

    def _hash(self, key: str) -> int:
        return int(hashlib.md5(key.encode('utf-8')).hexdigest(), 16)

    def add_node(self, node: str):
        for i in range(self.replicas):
            vkey = self._hash(f"{node}#vnode{i}")
            self.ring[vkey] = node
            bisect.insort(self.sorted_keys, vkey)

    def get_node(self, key: str) -> str:
        if not self.sorted_keys:
            return None
        h = self._hash(key)
        idx = bisect.bisect_right(self.sorted_keys, h)
        if idx == len(self.sorted_keys):
            idx = 0
        return self.ring[self.sorted_keys[idx]]`
      }
    },
    systemDesign: {
      capTheorem: "AP (High Availability)",
      capExplanation: "CDNs prioritize ultra-low latency and 100% availability. Cache items may be slightly stale (eventual consistency) until TTL expires or purge is propagated.",
      failureModes: [
        {
          name: "Cache Stampede (Thundering Herd)",
          symptoms: "High-traffic asset TTL expires; thousands of concurrent requests bypass CDN directly hitting origin DB.",
          mitigation: "Enable Origin Shielding, stale-while-revalidate headers, and request collapsing/coalescing.",
          blastRadius: "Origin database CPU spikes to 100%, causing cascading downtime."
        },
        {
          name: "BGP Route Leak / Anycast Flapping",
          symptoms: "Traffic for APAC routed to Europe; latency jumps from 15ms to 240ms.",
          mitigation: "Multi-CDN failover (e.g., Cloudflare + AWS CloudFront with DNS health checks).",
          blastRadius: "Elevated P99 latency without total outage."
        }
      ],
      throughputMath: {
        formula: "Origin Offload % = (Total Requests - Origin Requests) / Total Requests",
        explanation: "A 95% CDN cache hit ratio reduces a 10,000 RPS burst down to just 500 RPS on backend compute instances.",
        exampleCalc: "10,000 req/s @ 95% hit rate = 500 req/s on origin. 100 GB egress saved per million requests."
      },
      faangPattern: "Netflix Open Connect / Cloudflare Anycast: 300+ edge locations serve 98% of video & static bytes directly from local ISP IXPs."
    },
    quiz: [
      {
        id: "cdn-q1",
        question: "Why does consistent hashing use 'virtual nodes' (replicas) along the ring?",
        options: [
          "To encrypt the data stored in memory",
          "To prevent hot-spot skew and evenly distribute data across servers",
          "To allow TCP connections without handshakes",
          "To compress the hash table on disk"
        ],
        correctIndex: 1,
        explanation: "Without virtual nodes, a small number of physical nodes cluster unevenly on the ring, leading to unbalanced traffic allocation."
      },
      {
        id: "cdn-q2",
        question: "How does 'stale-while-revalidate' solve the thundering herd problem at edge caches?",
        options: [
          "It throws a 404 error until the origin cache is warm",
          "It delivers stale cached content immediately while 1 background request fetches the fresh version",
          "It forces all clients to wait in a serialized queue",
          "It clears the entire edge cache on every write"
        ],
        correctIndex: 1,
        explanation: "Delivering stale content immediately eliminates latency spikes and collapses thousands of simultaneous misses into a single background fetch."
      },
      {
        id: "cdn-q3",
        question: "What is the Big-O time complexity of a Bloom Filter membership check?",
        options: ["O(N)", "O(log N)", "O(k) where k is the number of hash functions", "O(1) amortized worst-case O(N^2)"],
        correctIndex: 2,
        explanation: "A Bloom Filter hashes the key k times and checks k bit array offsets, taking strictly O(k) time regardless of item count."
      }
    ]
  },

  waf: {
    nodeType: "waf",
    title: "Web Application Firewall & Rate Limiter",
    category: "Security & Edge",
    primaryRole: "Inspect HTTP payloads for OWASP Top 10 vulnerabilities (SQLi, XSS) and throttle IP bursts using leaky/token buckets.",
    dsa: {
      coreDataStructures: [
        "Token Bucket / Leaky Bucket (Burst rate limiting with steady refill)",
        "Sliding Window Log / Counter (Accurate rolling rate limiting across boundaries)",
        "Aho-Corasick Automaton (Multi-pattern linear string matching for attack signatures)",
        "Radix Tree / Trie (IP CIDR block lookup in O(32) for IPv4)"
      ],
      algorithms: [
        {
          name: "Token Bucket Algorithm",
          complexity: { time: "O(1) evaluation", space: "O(1) per client IP in Redis" },
          description: "Bucket holds up to B tokens, refilled at rate R tokens/sec. Request consumes 1 token. If empty, returns HTTP 429.",
          whyUsedInCloud: "Permits short legitimate bursts while strictly bounding average sustained traffic."
        },
        {
          name: "Sliding Window Counter",
          complexity: { time: "O(1) lookup & math", space: "O(1) per IP" },
          description: "Weighted sum of previous window count and current window count based on elapsed timestamp percentage.",
          whyUsedInCloud: "Eliminates boundary double-burst vulnerability of fixed-window limiters with minimal memory."
        },
        {
          name: "Aho-Corasick String Matcher",
          complexity: { time: "O(N + M) where N = text length, M = matches", space: "O(Trie size)" },
          description: "Trie with dictionary suffix failure links, enabling parallel search of 1,000+ SQLi patterns in single pass.",
          whyUsedInCloud: "WAF inspects incoming query params and headers without stalling request pipeline."
        }
      ],
      codeSnippets: {
        typescript: `// TypeScript: Token Bucket Rate Limiter
class TokenBucket {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private capacity: number = 60,
    private refillRatePerSec: number = 10
  ) {
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  public allowRequest(tokensRequested: number = 1): boolean {
    const now = Date.now();
    const elapsedSec = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsedSec * this.refillRatePerSec);
    this.lastRefill = now;

    if (this.tokens >= tokensRequested) {
      this.tokens -= tokensRequested;
      return true; // Allow
    }
    return false; // HTTP 429 Too Many Requests
  }
}`,
        python: `# Python 3: Token Bucket Rate Limiter
import time

class TokenBucket:
    def __init__(self, capacity: int = 60, refill_rate_per_sec: float = 10.0):
        self.capacity = capacity
        self.refill_rate = refill_rate_per_sec
        self.tokens = capacity
        self.last_refill = time.time()

    def allow_request(self, tokens: int = 1) -> bool:
        now = time.time()
        elapsed = now - self.last_refill
        self.tokens = min(self.capacity, self.tokens + elapsed * self.refill_rate)
        self.last_refill = now

        if self.tokens >= tokens:
            self.tokens -= tokens
            return True
        return False  # Drop / 429`
      }
    },
    systemDesign: {
      capTheorem: "AP (High Availability)",
      capExplanation: "Rate limiters must fail-open on internal cache disconnect. Dropping legitimate users due to limiter downtime is unacceptable.",
      failureModes: [
        {
          name: "DDoS State Table Memory Exhaustion",
          symptoms: "Attacker uses 100,000 spoofed IPs; Redis memory fills up tracking rate limits.",
          mitigation: "Use sliding window counters with active TTL eviction and IP CIDR aggregation.",
          blastRadius: "WAF node crashes, exposing origin to direct flood."
        },
        {
          name: "ReDoS (Regular Expression Denial of Service)",
          symptoms: "Catastrophic backtracking on malicious regex payload spikes WAF CPU to 100%.",
          mitigation: "Use DFA-based non-backtracking engines (RE2 or Aho-Corasick) instead of NFA regex.",
          blastRadius: "Latency jumps to 15,000ms on all requests."
        }
      ],
      throughputMath: {
        formula: "Max Sustained QPS = Refill Rate; Burst Capacity = Bucket Size",
        explanation: "A bucket of 100 tokens with 20 tokens/sec refill allows 100 concurrent requests instantly, settling to 20 QPS.",
        exampleCalc: "At 1,000 active IPs, Redis stores 1,000 keys * 32 bytes = 32 KB RAM overhead."
      },
      faangPattern: "AWS WAF / Cloudflare Magic Transit: In-memory sliding window counters with eBPF kernel packet filtering drop bad actors before TCP socket creation."
    },
    quiz: [
      {
        id: "waf-q1",
        question: "What flaw in Fixed Window rate limiting does the Sliding Window algorithm fix?",
        options: [
          "Fixed window cannot handle IPv6 addresses",
          "Fixed window permits 2x the limit across window boundaries (e.g. 59s and 01s)",
          "Fixed window requires O(N^2) memory",
          "Fixed window drops all websocket traffic"
        ],
        correctIndex: 1,
        explanation: "If a user sends full quota at the end of window 1 and beginning of window 2, fixed window allows double the burst without throttling."
      },
      {
        id: "waf-q2",
        question: "Why is Google's RE2 or Aho-Corasick preferred over PCRE regex in production WAFs?",
        options: [
          "PCRE cannot match ASCII characters",
          "RE2 guarantees linear O(N) execution time and eliminates catastrophic backtracking",
          "RE2 automatically updates SQL tables",
          "PCRE requires root access on the client machine"
        ],
        correctIndex: 1,
        explanation: "PCRE uses NFA with backtracking, which malicious payloads exploit to cause ReDoS CPU spikes. RE2 guarantees O(N) execution."
      },
      {
        id: "waf-q3",
        question: "In distributed rate limiting, how do Redis Lua scripts ensure atomic rate-limit checks?",
        options: [
          "By locking the entire Redis database across all keys",
          "By executing GET, increment, and EXPIRE in a single single-threaded step without race conditions",
          "By compiling the script to C++ assembly",
          "By sending synchronous HTTP callbacks to each node"
        ],
        correctIndex: 1,
        explanation: "Redis executes Lua scripts atomically, preventing race conditions between reading current token count and updating it."
      }
    ]
  },

  lb: {
    nodeType: "lb",
    title: "Load Balancer & Reverse Proxy",
    category: "Networking & Gateway",
    primaryRole: "Terminate SSL/TLS, multiplex TCP sockets (HTTP/2 to HTTP/1.1), and balance requests evenly across backend compute nodes.",
    dsa: {
      coreDataStructures: [
        "Weighted Round Robin (GCD-based sequence generation)",
        "Least Connections Min-Heap (Picks compute node with lowest active TCP sockets in O(log N))",
        "Consistent Hashing with IP Hash (Session affinity / sticky sessions)",
        "Power of Two Random Choices (Pick 2 random nodes, dispatch to lesser loaded: O(1) with near-optimal load)"
      ],
      algorithms: [
        {
          name: "Weighted Round Robin with GCD",
          complexity: { time: "O(1) dispatch", space: "O(N) backend list" },
          description: "Calculates greatest common divisor of weights. Increments current weight and routes requests accordingly.",
          whyUsedInCloud: "Distributes more traffic to powerful 4 vCPU instances while shielding smaller 1 vCPU instances."
        },
        {
          name: "Power of Two Random Choices",
          complexity: { time: "O(1) dispatch", space: "O(N)" },
          description: "Picks 2 random backend candidates and chooses the one with fewest connections.",
          whyUsedInCloud: "Avoids herd behavior of standard Least Connections while eliminating centralized lock contention."
        },
        {
          name: "Health Check Circuit Breaker State Machine",
          complexity: { time: "O(1) check", space: "O(N)" },
          description: "Transition states: Closed (healthy), Open (failed 3 health checks), Half-Open (canary testing).",
          whyUsedInCloud: "Instantly routes traffic away from crashed container instances before users experience 502/504 errors."
        }
      ],
      codeSnippets: {
        typescript: `// TypeScript: Weighted Round Robin Dispatcher
interface BackendNode {
  id: string;
  weight: number;
  currentWeight: number;
}

class WeightedRoundRobin {
  constructor(private nodes: BackendNode[]) {}

  public getNextNode(): BackendNode | null {
    if (this.nodes.length === 0) return null;
    let totalWeight = 0;
    let selectedNode: BackendNode = this.nodes[0];

    for (const node of this.nodes) {
      node.currentWeight += node.weight;
      totalWeight += node.weight;
      if (node.currentWeight > selectedNode.currentWeight) {
        selectedNode = node;
      }
    }

    selectedNode.currentWeight -= totalWeight;
    return selectedNode;
  }
}`,
        python: `# Python 3: Weighted Round Robin Dispatcher
class BackendNode:
    def __init__(self, node_id: str, weight: int):
        self.node_id = node_id
        self.weight = weight
        self.current_weight = 0

class WeightedRoundRobin:
    def __init__(self, nodes: list):
        self.nodes = nodes

    def get_next_node(self) -> BackendNode:
        if not self.nodes:
            return None
        total_weight = sum(n.weight for n in self.nodes)
        selected = self.nodes[0]

        for node in self.nodes:
            node.current_weight += node.weight
            if node.current_weight > selected.current_weight:
                selected = node

        selected.current_weight -= total_weight
        return selected`
      }
    },
    systemDesign: {
      capTheorem: "CA (Local Cluster)",
      capExplanation: "Load balancers reside inside the cluster network. High availability is achieved via Active-Passive keepalived (VRRP) or cloud-managed virtual IPs.",
      failureModes: [
        {
          name: "Ephemeral Port Exhaustion",
          symptoms: "Load balancer runs out of outbound source ports (65,535 TCP limit) connecting to backend.",
          mitigation: "Enable HTTP keep-alive connection pooling to backend; add multiple private IPs to LB.",
          blastRadius: "502 Bad Gateway across all users despite low backend CPU."
        },
        {
          name: "Health Check Flapping",
          symptoms: "Heavy traffic causes temporary health check timeouts; LB evicts healthy nodes, overloading remaining nodes.",
          mitigation: "Separate application traffic from health check endpoints; increase failure threshold to 3 consecutive misses.",
          blastRadius: "Cascading crash of entire backend cluster."
        }
      ],
      throughputMath: {
        formula: "Max Connections = (Worker Processes) * (Worker Connections)",
        explanation: "An Nginx reverse proxy with 4 workers and 4,096 connections handles 16,384 concurrent TCP sockets.",
        exampleCalc: "At 1,000 RPS with 50ms average backend response time: 1,000 * 0.05 = 50 concurrent backend connections."
      },
      faangPattern: "Google Maglev / AWS ALB: Maglev uses consistent hashing with lookup tables to route millions of packets per second without connection tracking state synchronization."
    },
    quiz: [
      {
        id: "lb-q1",
        question: "Why is 'Power of Two Random Choices' often superior to global 'Least Connections' in large clusters?",
        options: [
          "It cuts the memory consumption by half",
          "It eliminates the bottleneck of centralized connection counting while avoiding thundering herd",
          "It automatically encrypts TLS certs",
          "It runs directly in the browser JavaScript engine"
        ],
        correctIndex: 1,
        explanation: "Global least-connections requires synchronized locks across all proxy nodes. Picking two random nodes achieves near-optimal load distribution in O(1)."
      },
      {
        id: "lb-q2",
        question: "What HTTP header does a reverse proxy attach so the backend app knows the real user's IP?",
        options: ["X-Forwarded-For", "Authorization", "Accept-Encoding", "Content-Security-Policy"],
        correctIndex: 0,
        explanation: "X-Forwarded-For contains the comma-separated chain of client and intermediate proxy IP addresses."
      },
      {
        id: "lb-q3",
        question: "What is the primary danger of using Sticky Sessions (cookie-based affinity)?",
        options: [
          "It invalidates TLS certificates",
          "It breaks load balancing during traffic spikes by routing heavy users to a single saturated node",
          "It reduces network bandwidth to zero",
          "It forces the database into read-only mode"
        ],
        correctIndex: 1,
        explanation: "Sticky sessions tie users to specific servers; if a power user generates heavy workload, that server overloads while others stay idle."
      }
    ]
  },

  app: {
    nodeType: "app",
    title: "Application Compute Cluster",
    category: "Compute & Execution",
    primaryRole: "Execute business logic, authenticate sessions, process API transactions, and orchestrate persistence queries.",
    dsa: {
      coreDataStructures: [
        "Event Loop / Epoll Queue (Reactor pattern: single-threaded async non-blocking I/O)",
        "Worker Thread Pool & Task Queue (Bounded blocking queue with thread executor)",
        "Circuit Breaker Finite State Machine (Closed -> Open -> Half-Open)",
        "Bounded Semaphore (Limits concurrent outbound database queries to prevent starvation)"
      ],
      algorithms: [
        {
          name: "Event-Driven Reactor Pattern (epoll/kqueue)",
          complexity: { time: "O(1) event readiness notification", space: "O(N) open file descriptors" },
          description: "OS notifies user space when sockets have data ready to read, eliminating 1-thread-per-connection memory bloat.",
          whyUsedInCloud: "Allows Node.js, Go, and Fastify to serve 50,000+ idle WebSocket clients with tiny memory footprint."
        },
        {
          name: "Circuit Breaker State Machine",
          complexity: { time: "O(1) transition", space: "O(1) per dependency" },
          description: "Monitors downstream API error rate. If > 50% errors in 10s window, trips to OPEN and fast-fails immediately.",
          whyUsedInCloud: "Prevents slow third-party payment gateways from exhausting application worker threads."
        },
        {
          name: "Exponential Backoff with Full Jitter",
          complexity: { time: "O(1) per retry", space: "O(1)" },
          description: "Sleep = Random(0, Min(Cap, Base * 2^attempt)). Jitter de-correlates retries across distributed clients.",
          whyUsedInCloud: "Prevents self-inflicted DDoS when downstream database recovers from restart."
        }
      ],
      codeSnippets: {
        typescript: `// TypeScript: Circuit Breaker with Failure Threshold & Cooldown
enum CircuitState { CLOSED, OPEN, HALF_OPEN }

class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private nextAttempt: number = 0;

  constructor(
    private threshold: number = 5,
    private cooldownMs: number = 10000
  ) {}

  public async execute<T>(fn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    if (this.state === CircuitState.OPEN) {
      if (now < this.nextAttempt) {
        throw new Error("CircuitBreaker: OPEN (Fast Fail)");
      }
      this.state = CircuitState.HALF_OPEN;
    }

    try {
      const result = await fn();
      if (this.state === CircuitState.HALF_OPEN) {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
      }
      return result;
    } catch (err) {
      this.failureCount++;
      if (this.failureCount >= this.threshold) {
        this.state = CircuitState.OPEN;
        this.nextAttempt = now + this.cooldownMs;
      }
      throw err;
    }
  }
}`,
        python: `# Python 3: Exponential Backoff with Full Jitter
import random
import time

def retry_with_jitter(operation, max_retries=5, base_delay=0.1, max_delay=5.0):
    for attempt in range(max_retries):
        try:
            return operation()
        except Exception as err:
            if attempt == max_retries - 1:
                raise err
            # Full Jitter formula
            high = min(max_delay, base_delay * (2 ** attempt))
            sleep_time = random.uniform(0, high)
            time.sleep(sleep_time)`
      }
    },
    systemDesign: {
      capTheorem: "AP (High Availability)",
      capExplanation: "Stateless compute nodes scale horizontally across instances. Session state is delegated to Redis or signed JWTs.",
      failureModes: [
        {
          name: "Node.js Event Loop Blocking",
          symptoms: "Sync CPU operation (JSON.parse(50MB) or bcrypt sync) blocks the single thread; all other API requests freeze.",
          mitigation: "Offload CPU tasks to worker threads; use async crypto primitives; monitor event loop lag with clinic.js.",
          blastRadius: "P99 latency spikes from 15ms to 5,000ms."
        },
        {
          name: "Memory Leak via Unbounded In-Memory Map",
          symptoms: "RAM steadily climbs until Linux OOM Killer terminates the process (SIGKILL).",
          mitigation: "Enforce strict process restart policies (Docker restart: unless-stopped), heap profiling, and externalize state.",
          blastRadius: "Sudden container crash cycling."
        }
      ],
      throughputMath: {
        formula: "Max RPS per Node = (1000ms / Avg Response Latency ms) * Concurrent Concurrency Limit",
        explanation: "A Node.js microservice taking 20ms per query and handling 25 concurrent queries produces 1,250 RPS per instance.",
        exampleCalc: "2 nodes = 2,500 RPS. 4 nodes (Hostinger KVM 4) = 5,000 RPS."
      },
      faangPattern: "Stateless 12-Factor App: Application containers store zero state on local disk. Everything resides in managed databases, Redis, or S3/R2."
    },
    quiz: [
      {
        id: "app-q1",
        question: "Why is 'Full Jitter' critical when implementing exponential backoff retries in microservices?",
        options: [
          "It compresses the payload during retries",
          "It spreads out retries randomly across a timeline, preventing waves of synchronized retries from crashing a recovering database",
          "It bypasses TLS encryption to speed up retries",
          "It increases the socket buffer size"
        ],
        correctIndex: 1,
        explanation: "Without jitter, all clients retry at exactly 1s, 2s, 4s simultaneously, creating destructive recurring wave spikes."
      },
      {
        id: "app-q2",
        question: "What is the primary benefit of the Circuit Breaker pattern?",
        options: [
          "It doubles CPU clock speed",
          "It fails fast when a downstream dependency is unhealthy, preventing thread pool starvation in the caller",
          "It backs up the database to Amazon S3",
          "It enforces SQL injection filtering"
        ],
        correctIndex: 1,
        explanation: "By fast-failing immediately during outages, calling services do not waste threads and connection pools waiting for dead dependencies."
      },
      {
        id: "app-q3",
        question: "What happens when an application reaches its Linux Cgroups memory limit in a container?",
        options: [
          "Linux pages the memory to AWS Glacier",
          "The Linux OOM Killer sends SIGKILL (exit code 137) immediately terminating the container",
          "The CPU throttles to 10% clock speed",
          "The HTTP port closes gracefully"
        ],
        correctIndex: 1,
        explanation: "When memory exceeds container limits, the kernel OOM killer sends SIGKILL (kill -9), immediately terminating the process."
      }
    ]
  },

  pgbouncer: {
    nodeType: "pgbouncer",
    title: "PgBouncer Connection Pooler",
    category: "Database Gateway",
    primaryRole: "Multiplex thousands of ephemeral client connections into a small pool of 15-20 persistent PostgreSQL backend connections.",
    dsa: {
      coreDataStructures: [
        "Object Pool Pattern (Fixed array of pre-warmed database sockets)",
        "Circular Ring Buffer / Queue (LIFO or FIFO connection recycling)",
        "State Machine (Connection state tracking: Active, Idle, In-Transaction, Closed)"
      ],
      algorithms: [
        {
          name: "Transaction Pooling Mode",
          complexity: { time: "O(1) lease & release", space: "O(Max Server Connections)" },
          description: "Server connection is leased to a client only for the duration of a BEGIN...COMMIT block and immediately returned to pool.",
          whyUsedInCloud: "Enables 5,000 concurrent serverless or microservice clients to share 20 real Postgres worker processes."
        },
        {
          name: "LIFO Connection Reuse Strategy",
          complexity: { time: "O(1)", space: "O(N)" },
          description: "Picks the most recently returned connection first to keep CPU and TCP socket buffers warm in OS cache.",
          whyUsedInCloud: "Reduces memory footprint by allowing cold unused backend connections to be closed by idle timeout."
        }
      ],
      codeSnippets: {
        typescript: `// TypeScript: Lightweight Connection Pool (Object Pool Pattern)
class ConnectionPool<T> {
  private available: T[] = [];
  private inUse: Set<T> = new Set();

  constructor(
    private factory: () => Promise<T>,
    private maxConnections: number = 20
  ) {}

  public async acquire(): Promise<T> {
    if (this.available.length > 0) {
      const conn = this.available.pop()!;
      this.inUse.add(conn);
      return conn;
    }
    if (this.inUse.size < this.maxConnections) {
      const conn = await this.factory();
      this.inUse.add(conn);
      return conn;
    }
    throw new Error("Pool Exhaustion: Max connections reached");
  }

  public release(conn: T) {
    this.inUse.delete(conn);
    this.available.push(conn);
  }
}`,
        python: `# Python 3: Async Connection Pool Simulator
import asyncio

class AsyncConnectionPool:
    def __init__(self, max_connections: int = 15):
        self.max_connections = max_connections
        self.available = asyncio.Queue()
        self.current_count = 0
        self.lock = asyncio.Lock()

    async def acquire(self):
        async with self.lock:
            if self.available.empty() and self.current_count < self.max_connections:
                self.current_count += 1
                return f"db-conn-{self.current_count}"
        return await self.available.get()

    async def release(self, conn):
        await self.available.put(conn)`
      }
    },
    systemDesign: {
      capTheorem: "CP (Strong Consistency)",
      capExplanation: "Guarantees transaction isolation and ordered byte streams directly to the relational database persistence engine.",
      failureModes: [
        {
          name: "Transaction Pooling Prepared Statement Conflict",
          symptoms: "Client uses prepared statements without protocol-level naming; next transaction gets 'prepared statement already exists'.",
          mitigation: "Use session-level prepared statement flags, pgbouncer >= 1.21 protocol-level prepared statements, or ORM poolers.",
          blastRadius: "Database queries fail with SQLSTATE 42P05."
        },
        {
          name: "Connection Pool Starvation",
          symptoms: "Unindexed query holds a transaction lock for 30s; all pool connections block; app latency jumps.",
          mitigation: "Set statement_timeout = 3000ms and idle_in_transaction_session_timeout = 5000ms.",
          blastRadius: "Entire app unable to obtain DB connection."
        }
      ],
      throughputMath: {
        formula: "PostgreSQL Memory per Conn = ~10 MB RAM; PgBouncer Memory per Client = ~2 KB RAM",
        explanation: "1,000 direct PostgreSQL connections consume ~10 GB RAM. Routing through PgBouncer consumes just 2 MB RAM.",
        exampleCalc: "Saves 9.98 GB RAM, allowing a 4GB VPS (Hostinger KVM 1 / DigitalOcean 4GB) to outperform an unpooled 16GB server."
      },
      faangPattern: "Supabase Supavisor / AWS RDS Proxy / PgBouncer: Standard architecture deployed across every production PostgreSQL stack."
    },
    quiz: [
      {
        id: "pool-q1",
        question: "Why does PostgreSQL suffer when direct connection count exceeds ~200?",
        options: [
          "Postgres is written in Python which has a Global Interpreter Lock",
          "Postgres uses a process-per-connection model where each connection consumes ~10MB RAM and triggers OS context switching",
          "Postgres limits socket numbers to 128",
          "Postgres automatically drops connections after 10 seconds"
        ],
        correctIndex: 1,
        explanation: "Unlike thread-per-request servers, PostgreSQL forks a separate OS process per connection, causing high memory usage and context-switching overhead."
      },
      {
        id: "pool-q2",
        question: "Which PgBouncer pooling mode allows the highest client multiplexing density?",
        options: ["Session Pooling", "Transaction Pooling", "Statement Pooling", "Thread Pooling"],
        correctIndex: 1,
        explanation: "Transaction pooling leases connections only while a transaction is actively executing, multiplexing thousands of clients onto a tiny pool."
      },
      {
        id: "pool-q3",
        question: "What PostgreSQL feature is incompatible with classic PgBouncer transaction pooling?",
        options: ["SELECT queries", "SET SESSION variables and non-named prepared statements", "INSERT statements", "Foreign Keys"],
        correctIndex: 1,
        explanation: "Session-level settings like SET search_path bleed into other clients in transaction pooling mode because the server connection is shared."
      }
    ]
  },

  postgres: {
    nodeType: "postgres",
    title: "PostgreSQL Relational Persistence",
    category: "Database & Storage",
    primaryRole: "ACID transactions, durable multi-table relational persistence, complex indexing, and relational foreign-key integrity.",
    dsa: {
      coreDataStructures: [
        "B+ Tree Indexing (High fanout, disk-page aligned sorted tree O(log_B N))",
        "Write-Ahead Log (WAL: Sequential append-only crash recovery log)",
        "MVCC (Multi-Version Concurrency Control with xmin/xmax tuple headers)",
        "Bloom Filters (PostgreSQL 14+ index skip scan optimization)"
      ],
      algorithms: [
        {
          name: "B+ Tree Index Search & Range Scan",
          complexity: { time: "O(log_B N) search, O(K) range scan", space: "O(N) disk blocks" },
          description: "Internal nodes store only routing keys; leaf nodes contain all data pointers linked sequentially for instant range scans.",
          whyUsedInCloud: "Enables sub-millisecond point lookups and range queries over billions of records with minimal disk seeks."
        },
        {
          name: "Write-Ahead Logging (WAL) Protocol",
          complexity: { time: "O(1) sequential append", space: "O(WAL segment files)" },
          description: "Changes are appended to sequential WAL on disk before dirty pages are flushed to table heap files.",
          whyUsedInCloud: "Provides durability (D in ACID) and enables asynchronous/synchronous streaming replication to read replicas."
        },
        {
          name: "Two-Phase Locking (2PL) & MVCC",
          complexity: { time: "O(1) row read without locks", space: "O(dead tuples)" },
          description: "Readers never block writers and writers never block readers. Dead tuples are cleaned up asynchronously via VACUUM.",
          whyUsedInCloud: "High concurrent read throughput while maintaining serializable or read-committed isolation levels."
        }
      ],
      codeSnippets: {
        typescript: `// TypeScript: B+ Tree Node Representation
class BPlusTreeNode<K, V> {
  public isLeaf: boolean;
  public keys: K[] = [];
  public values: V[] = []; // Only populated if isLeaf is true
  public children: BPlusTreeNode<K, V>[] = [];
  public nextLeaf: BPlusTreeNode<K, V> | null = null; // Linked list for fast range scans

  constructor(isLeaf: boolean = false) {
    this.isLeaf = isLeaf;
  }
}

// B+ Tree Range Scan demonstration
function rangeScan<K, V>(startLeaf: BPlusTreeNode<K, V>, minKey: K, maxKey: K): V[] {
  const results: V[] = [];
  let curr: BPlusTreeNode<K, V> | null = startLeaf;
  while (curr !== null) {
    for (let i = 0; i < curr.keys.length; i++) {
      if (curr.keys[i] >= minKey && curr.keys[i] <= maxKey) {
        results.push(curr.values[i]);
      } else if (curr.keys[i] > maxKey) {
        return results;
      }
    }
    curr = curr.nextLeaf;
  }
  return results;
}`,
        python: `# Python 3: WAL (Write-Ahead Logging) Concept Simulator
import os
import json

class WALDatabase:
    def __init__(self, wal_path="wal.log"):
        self.wal_path = wal_path
        self.state = {}

    def commit_transaction(self, tx_id: int, key: str, value: str):
        # 1. First write sequentially to WAL
        log_entry = json.dumps({"tx_id": tx_id, "k": key, "v": value}) + "\\n"
        with open(self.wal_path, "a") as f:
            f.write(log_entry)
            f.flush()
            os.fsync(f.fileno()) # Force physical disk flush

        # 2. Update memory state (in-memory buffer pool)
        self.state[key] = value
        return True`
      }
    },
    systemDesign: {
      capTheorem: "CP (Strong Consistency)",
      capExplanation: "PostgreSQL enforces ACID transactions and strict data integrity. In a network partition, a replica must not accept writes that violate consistency.",
      failureModes: [
        {
          name: "Table Bloat (Vacuum Starvation)",
          symptoms: "Long-running transaction prevents autovacuum from cleaning dead tuples; table size balloons from 1GB to 20GB.",
          mitigation: "Tune autovacuum_vacuum_scale_factor = 0.05; set idle_in_transaction_session_timeout.",
          blastRadius: "Query times degrade exponentially due to excessive page reads."
        },
        {
          name: "Replication Lag Spillover",
          symptoms: "Heavy bulk write on primary exhausts network bandwidth to standby; read replica lags by seconds.",
          mitigation: "Use synchronous_commit = remote_write or offload heavy analytical batch writes to separate replicas.",
          blastRadius: "Users see stale data immediately after saving changes."
        }
      ],
      throughputMath: {
        formula: "Max Random IOPS = (Disk IOPS limit) / (Page read count per query)",
        explanation: "Gen4 NVMe SSDs (Hostinger / Hetzner) deliver 20,000+ random IOPS vs. 3,000 IOPS on baseline AWS gp3 EBS volumes.",
        exampleCalc: "A 4-disk index traversal @ 20k IOPS = 5,000 QPS potential throughput before CPU saturation."
      },
      faangPattern: "Primary-Replica Multi-AZ with Read Replicas: All INSERT/UPDATE queries hit the primary; read-heavy queries are balanced across read replicas."
    },
    quiz: [
      {
        id: "pg-q1",
        question: "Why do relational databases use B+ Trees instead of Binary Search Trees (BST) on disk?",
        options: [
          "B+ Trees use less RAM",
          "B+ Trees have high fanout (thousands of keys per node), reducing disk I/O depth to only 3-4 block reads",
          "Binary trees are not compatible with SQL syntax",
          "B+ trees eliminate the need for primary keys"
        ],
        correctIndex: 1,
        explanation: "Disk I/O is the primary bottleneck. A B+ Tree node matches the 8KB disk page size, storing hundreds of keys and keeping tree depth to 3-4 levels for millions of rows."
      },
      {
        id: "pg-q2",
        question: "What is the purpose of PostgreSQL Write-Ahead Logging (WAL)?",
        options: [
          "To log all user passwords for auditing",
          "To ensure changes are sequentially written to durable disk before flushing dirty pages, guaranteeing crash recovery",
          "To generate HTML dashboard reports",
          "To compress user avatars"
        ],
        correctIndex: 1,
        explanation: "Writing sequentially to the WAL is orders of magnitude faster than random table page writes, guaranteeing durability after power loss."
      },
      {
        id: "pg-q3",
        question: "What happens in PostgreSQL Multi-Version Concurrency Control (MVCC) when you execute an UPDATE statement?",
        options: [
          "It overwrites the existing row data in place",
          "It locks the entire table until the transaction commits",
          "It creates a new version of the row with new xmin/xmax transaction IDs; the old row becomes a dead tuple for VACUUM",
          "It converts the row to JSON format"
        ],
        correctIndex: 2,
        explanation: "PostgreSQL inserts a new tuple version and marks the old tuple with xmax. Dead tuples are reclaimed later by the autovacuum daemon."
      }
    ]
  },

  redis: {
    nodeType: "redis",
    title: "Redis In-Memory Cache & Key-Value Store",
    category: "In-Memory & Cache",
    primaryRole: "Sub-millisecond session storage, hot data caching, rate limiting, and pub/sub message broadcasting.",
    dsa: {
      coreDataStructures: [
        "Skip List (ZSET Sorted Sets: O(log N) insert/range without tree rebalancing)",
        "Redis Dict (Hash table with progressive incremental re-hashing)",
        "HyperLogLog (Cardinality estimation of 1B items in 12 KB using Flajolet-Martin algorithm)",
        "Radix Tree / Stream Listpack (Memory-optimized queue offsets)"
      ],
      algorithms: [
        {
          name: "Skip List for Sorted Sets (ZSET)",
          complexity: { time: "O(log N) search/insert", space: "O(N)" },
          description: "Probabilistic multi-level linked list. Each level skips forward across elements with 25% promotion probability.",
          whyUsedInCloud: "Powers real-time leaderboards, rate limiting sliding windows, and priority queues with zero lock contention."
        },
        {
          name: "Incremental Progressive Re-Hashing",
          complexity: { time: "O(1) amortized per operation", space: "O(2N) temporary" },
          description: "When table exceeds load factor, allocates table 2. Every GET/SET migrates 1 bucket index, avoiding latency pauses.",
          whyUsedInCloud: "Maintains < 1ms P99 latency even when resizing tables with 10 million keys."
        },
        {
          name: "Volatile-LRU / Allkeys-LRU Eviction",
          complexity: { time: "O(1) sampling", space: "O(1)" },
          description: "Samples 5 random keys and evicts the one with oldest lru idle clock, achieving true LRU accuracy without list pointers.",
          whyUsedInCloud: "Saves 16 bytes of pointer overhead per key, storing 30% more data in RAM."
        }
      ],
      codeSnippets: {
        typescript: `// TypeScript: Skip List Node & Structure Concept
class SkipListNode<K, V> {
  public forward: SkipListNode<K, V>[] = [];
  constructor(
    public key: K,
    public value: V,
    public level: number
  ) {
    this.forward = new Array(level + 1).fill(null);
  }
}

class SkipList<K, V> {
  private head: SkipListNode<K, V>;
  private maxLevel: number = 16;
  private currentLevel: number = 0;

  constructor() {
    this.head = new SkipListNode<any, any>(null, null, this.maxLevel);
  }

  private randomLevel(): number {
    let lvl = 0;
    while (Math.random() < 0.25 && lvl < this.maxLevel) lvl++;
    return lvl;
  }
}`,
        python: `# Python 3: Cache-Aside Pattern with Redis
import json

class CacheAsideService:
    def __init__(self, redis_client, db_client):
        self.redis = redis_client
        self.db = db_client

    def get_user_profile(self, user_id: str):
        cache_key = f"user:{user_id}"
        # 1. Check cache first (sub-millisecond)
        cached = self.redis.get(cache_key)
        if cached:
            return json.loads(cached)

        # 2. Cache miss -> query primary database
        data = self.db.query_user(user_id)
        if data:
            # 3. Write to cache with TTL to avoid stale data
            self.redis.setex(cache_key, 3600, json.dumps(data))
        return data`
      }
    },
    systemDesign: {
      capTheorem: "AP (High Availability)",
      capExplanation: "Redis Sentinel and Redis Cluster prioritize speed and availability. Asynchronous replication means recent writes can be lost during failover.",
      failureModes: [
        {
          name: "Cache Penetration (Non-existent Key Flood)",
          symptoms: "Attacker queries random user IDs (e.g. user:-999); queries bypass cache directly hitting the database.",
          mitigation: "Store null values with short TTL (60s) or deploy a Bloom Filter at edge to reject non-existent IDs.",
          blastRadius: "Database CPU reaches 100%."
        },
        {
          name: "Cache Avalanche (Massive Simultaneous TTL Expiration)",
          symptoms: "Thousands of keys set with exact same 1-hour expiration expire simultaneously, causing sudden origin spike.",
          mitigation: "Add random jitter to cache TTLs: TTL = BaseTTL + Random(-300s, 300s).",
          blastRadius: "Instantaneous database overload."
        }
      ],
      throughputMath: {
        formula: "Redis Single-Thread Throughput = ~100,000 QPS per Core",
        explanation: "In-memory operations eliminate disk seek latency completely. Network I/O is multi-threaded (Redis 6+).",
        exampleCalc: "A 1GB Redis instance stores ~1,000,000 cached user objects (1 KB each)."
      },
      faangPattern: "Cache-Aside & Write-Through: Hot session tokens, cart data, and rate-limit counters reside strictly in Redis."
    },
    quiz: [
      {
        id: "redis-q1",
        question: "Why did Redis choose Skip Lists instead of Red-Black Trees for Sorted Sets (ZSET)?",
        options: [
          "Skip Lists are easier to implement, support simpler lock-free concurrency, and excel at range queries (ZRANGEBYSCORE)",
          "Red-Black trees cannot store floating-point numbers",
          "Skip lists use 90% less memory than any tree",
          "Redis is single-threaded so trees are illegal"
        ],
        correctIndex: 0,
        explanation: "Skip Lists allow simple range scanning by traversing the lowest-level linked list and require no complex tree rotations during mutations."
      },
      {
        id: "redis-q2",
        question: "How does the 'Cache-Aside' (Lazy Loading) pattern work?",
        options: [
          "The application checks cache; on miss, loads from DB, writes to cache, and returns",
          "The database automatically pushes all changes to Redis via triggers",
          "Redis writes all data to tape backup every hour",
          "The client browser directly contacts Redis"
        ],
        correctIndex: 0,
        explanation: "Cache-aside queries the cache first. Only on a miss does it read from the database and populate the cache with an expiration TTL."
      },
      {
        id: "redis-q3",
        question: "What technique prevents the 'Cache Avalanche' failure mode?",
        options: [
          "Setting all cache keys with infinite TTL",
          "Adding a random jitter (variance) to key expiration timestamps",
          "Disabling Redis replication",
          "Upgrading the database CPU"
        ],
        correctIndex: 1,
        explanation: "Adding random jitter ensures keys expire smoothly over a time window rather than all at once, preventing thundering herd spikes."
      }
    ]
  },

  s3: {
    nodeType: "s3",
    title: "Object Storage & Media Vault",
    category: "Storage & Persistence",
    primaryRole: "Durable, infinitely scalable storage for static assets, user uploads, logs, and database snapshots with S3 API compatibility.",
    dsa: {
      coreDataStructures: [
        "LSM-Tree (Log-Structured Merge Tree: Sequential SSTables with MemTable)",
        "Consistent Hashing Partition Keys (Distributes objects across storage nodes)",
        "Erasure Coding (Reed-Solomon 8+4 chunking: survives 4 drive failures with only 50% storage overhead)",
        "Merkle Trees (Anti-entropy background consistency verification across replicas)"
      ],
      algorithms: [
        {
          name: "Reed-Solomon Erasure Coding (8+4)",
          complexity: { time: "O(K * M) matrix multiplication", space: "M / K redundancy" },
          description: "Divides 1 object into K data chunks and generates M parity chunks using Vandermonde / Cauchy matrices.",
          whyUsedInCloud: "Delivers 11 9s durability (99.999999999%) at a fraction of the cost of 3x full disk replication."
        },
        {
          name: "LSM-Tree SSTable Compaction",
          complexity: { time: "O(N) sequential merge", space: "O(1) streaming" },
          description: "Writes append to in-memory MemTable, flushed to sorted string tables (SSTables) and compacted in background.",
          whyUsedInCloud: "Enables fast ingest of millions of concurrent file uploads without random disk seeks."
        }
      ],
      codeSnippets: {
        typescript: `// TypeScript: Presigned URL Generation Flow
import crypto from "crypto";

function generatePresignedUploadUrl(
  bucket: string,
  objectKey: string,
  secretKey: string,
  expiresInSec: number = 300
): { uploadUrl: string; expiresAt: number } {
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSec;
  const stringToSign = \`PUT\\n\\napplication/octet-stream\\n\${expiresAt}\\n/\${bucket}/\${objectKey}\`;
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(stringToSign)
    .digest("base64");

  return {
    uploadUrl: \`https://\${bucket}.r2.cloudflarestorage.com/\${objectKey}?Expires=\${expiresAt}&Signature=\${encodeURIComponent(signature)}\`,
    expiresAt
  };
}`,
        python: `# Python 3: Multipart S3 Upload Splitter
import math

def calculate_multipart_chunks(file_size_bytes: int, target_part_size_mb: int = 10):
    part_size = target_part_size_mb * 1024 * 1024
    num_parts = math.ceil(file_size_bytes / part_size)
    chunks = []
    for i in range(num_parts):
        start = i * part_size
        end = min(file_size_bytes, start + part_size)
        chunks.append({"part_number": i + 1, "start_byte": start, "end_byte": end})
    return chunks`
      }
    },
    systemDesign: {
      capTheorem: "AP (High Availability)",
      capExplanation: "Object stores provide eventual consistency for overwrites across global regions, prioritizing unlimited ingest availability and durability.",
      failureModes: [
        {
          name: "Egress Bill Shock (Bandwidth Lock-in)",
          symptoms: "Public users download files directly from AWS S3, incurring $0.09/GB egress fee ($900 per 10 TB).",
          mitigation: "Route public traffic through Cloudflare R2 ($0 egress) or cache via CloudFront with origin shielding.",
          blastRadius: "Compounding monthly cloud bill overrun."
        },
        {
          name: "Server Memory Exhaustion on Uploads",
          symptoms: "Clients stream 500MB video through app server memory buffer, crashing the container.",
          mitigation: "Use S3 Presigned URLs so clients upload directly to S3/R2 bypassing backend compute entirely.",
          blastRadius: "Container OOM."
        }
      ],
      throughputMath: {
        formula: "Durability = 1 - (Failure Probability per Drive ^ Parity Chunk Count)",
        explanation: "11 Nines (99.999999999%) durability means losing 1 file out of 10,000 objects takes 10,000,000 years.",
        exampleCalc: "Cloudflare R2 at $0.015/GB costs $15/month for 1 TB storage with ZERO egress charges."
      },
      faangPattern: "Direct-to-Storage Presigned Uploads: Web/Mobile apps request a 5-minute cryptographic presigned PUT URL and upload directly to S3/R2."
    },
    quiz: [
      {
        id: "s3-q1",
        question: "Why should clients upload large files via Presigned URLs instead of through the application server?",
        options: [
          "Presigned URLs automatically encode video to MP4",
          "Direct uploads bypass application servers, eliminating bandwidth bottlenecks, memory buffer bloat, and server scaling costs",
          "Presigned URLs don't need HTTPS",
          "Browsers cannot send POST requests to app servers"
        ],
        correctIndex: 1,
        explanation: "Presigned URLs grant temporary write permission directly to object storage, shielding app servers from heavy streaming I/O."
      },
      {
        id: "s3-q2",
        question: "How does Erasure Coding (e.g. Reed-Solomon 8+4) compare to 3x full replication?",
        options: [
          "Erasure coding uses 50% storage overhead vs. 200% overhead for 3x replication while providing equal or greater durability",
          "Erasure coding takes 10x more disk space",
          "3x replication cannot survive any disk failure",
          "Erasure coding only works with text files"
        ],
        correctIndex: 0,
        explanation: "8+4 erasure coding adds only 50% parity overhead (12 chunks for 8 chunks of data) yet can survive 4 simultaneous disk crashes."
      },
      {
        id: "s3-q3",
        question: "What is the primary FinOps advantage of Cloudflare R2 over Amazon S3?",
        options: [
          "R2 is only available in Europe",
          "R2 charges zero outbound data transfer (egress) fees to the public internet",
          "R2 deletes old files automatically",
          "R2 does not require authentication"
        ],
        correctIndex: 1,
        explanation: "Amazon S3 charges ~$0.09/GB for data egress; Cloudflare R2 has $0 per-GB egress fees, eliminating egress bill shock."
      }
    ]
  },

  queue: {
    nodeType: "queue",
    title: "Message Broker & Task Queue",
    category: "Asynchronous Messaging",
    primaryRole: "Decouple synchronous HTTP request threads from slow background jobs (emails, webhooks, video transcoding, PDF generation).",
    dsa: {
      coreDataStructures: [
        "Ring Buffer / Circular Queue (High-throughput zero-allocation Disruptor pattern)",
        "Min-Heap (Priority queue for scheduled & delayed retry execution in O(log N))",
        "Append-Only Commit Log (Kafka-style partitioned disk log with sequential offsets)"
      ],
      algorithms: [
        {
          name: "Leaky Bucket Consumer Throttling",
          complexity: { time: "O(1)", space: "O(1)" },
          description: "Pulls messages from queue at a smooth fixed rate to protect downstream third-party APIs from being banned.",
          whyUsedInCloud: "Enforces rate limits when calling SendGrid, Twilio, or Stripe webhooks."
        },
        {
          name: "Dead Letter Queue (DLQ) with Exponential Retry",
          complexity: { time: "O(1) push", space: "O(M) failed messages" },
          description: "Messages that fail 5 retry attempts are diverted to a DLQ for manual inspection and replay.",
          whyUsedInCloud: "Prevents a 'poison pill' payload from causing infinite crash loops on background worker instances."
        }
      ],
      codeSnippets: {
        typescript: `// TypeScript: Circular Ring Buffer Queue
class CircularQueue<T> {
  private buffer: (T | null)[];
  private head: number = 0;
  private tail: number = 0;
  private size: number = 0;

  constructor(private capacity: number = 1024) {
    this.buffer = new Array(capacity).fill(null);
  }

  public enqueue(item: T): boolean {
    if (this.size === this.capacity) return false; // Buffer Full
    this.buffer[this.tail] = item;
    this.tail = (this.tail + 1) % this.capacity;
    this.size++;
    return true;
  }

  public dequeue(): T | null {
    if (this.size === 0) return null; // Buffer Empty
    const item = this.buffer[this.head];
    this.buffer[this.head] = null;
    this.head = (this.head + 1) % this.capacity;
    this.size--;
    return item;
  }
}`,
        python: `# Python 3: Delayed Priority Queue using Heap
import heapq
import time

class DelayedTaskQueue:
    def __init__(self):
        self.heap = []

    def schedule_task(self, task_name: str, delay_seconds: float):
        run_at = time.time() + delay_seconds
        heapq.heappush(self.heap, (run_at, task_name))

    def pop_ready_tasks(self):
        now = time.time()
        ready = []
        while self.heap and self.heap[0][0] <= now:
            _, task = heapq.heappop(self.heap)
            ready.append(task)
        return ready`
      }
    },
    systemDesign: {
      capTheorem: "CP (Strong Consistency)",
      capExplanation: "Guarantees at-least-once message delivery and strict ordering within partitions.",
      failureModes: [
        {
          name: "Poison Pill Message",
          symptoms: "A malformed JSON payload crashes the worker process; message is returned to queue, crashing the next worker indefinitely.",
          mitigation: "Catch unhandled parse errors, limit max_retries = 3, and route failing message to Dead Letter Queue (DLQ).",
          blastRadius: "Queue backlog explodes, halting all asynchronous workflows."
        },
        {
          name: "Consumer Lag Accumulation",
          symptoms: "Producers enqueue 2,000 tasks/sec; workers process only 800 tasks/sec; queue backlog grows by millions.",
          mitigation: "Autoscale worker nodes based on Queue Depth metrics (KEDA / AWS SQS Target Tracking).",
          blastRadius: "Delayed notifications and stale business reports."
        }
      ],
      throughputMath: {
        formula: "Required Workers = Ingest Rate (msgs/s) * Average Task Duration (s)",
        explanation: "1,000 incoming tasks/sec with average duration of 2 seconds requires at least 2,000 concurrent worker threads.",
        exampleCalc: "Decoupling saves users from waiting: HTTP API responds in 15ms instead of 2,000ms."
      },
      faangPattern: "BullMQ / SQS / Kafka: Decouples user-facing web tier from heavy background processing."
    },
    quiz: [
      {
        id: "queue-q1",
        question: "What is a 'Poison Pill' in a message queue system?",
        options: [
          "An encrypted message that cannot be decrypted",
          "A malformed message that consistently causes consumer workers to crash and gets repeatedly retried",
          "A message sent by a hacker to delete files",
          "A message that exceeds 10 GB in size"
        ],
        correctIndex: 1,
        explanation: "A poison pill message triggers unhandled exceptions in consumers. Without a Dead Letter Queue (DLQ), it repeatedly crashes workers in an infinite loop."
      },
      {
        id: "queue-q2",
        question: "Why is 'At-Least-Once' delivery standard in distributed message queues, and how must consumers handle it?",
        options: [
          "Consumers do not need to do anything because duplicate messages are impossible",
          "Network retries can deliver a message more than once, requiring consumers to be idempotent (e.g. deduplicating by message ID)",
          "At-least-once means only the first message is delivered",
          "It forces the consumer to reboot after every message"
        ],
        correctIndex: 1,
        explanation: "Network partitions make true exactly-once delivery practically impossible. Distributed systems guarantee at-least-once, requiring idempotent consumers."
      },
      {
        id: "queue-q3",
        question: "What metric is best for auto-scaling background worker nodes?",
        options: ["CPU utilization of the database", "Queue Depth / Consumer Lag (total unprocessed messages)", "Disk free space", "HTTP status code 200 count"],
        correctIndex: 1,
        explanation: "Queue depth directly reveals whether workers are keeping up with incoming traffic, allowing preemptive scaling before latency degrades."
      }
    ]
  }
};

export const CHAOS_SCENARIOS: ChaosScenario[] = [
  {
    id: "spike",
    name: "10x Traffic Spike (500 -> 5,000 RPS)",
    description: "Viral media launch or black Friday surge flooding the edge and origin compute layers simultaneously.",
    severity: "critical",
    triggerEffect: "Spikes requests per second 10-fold across all ingress subnets."
  },
  {
    id: "db-crash",
    name: "Primary Database Crash (WAL Panic)",
    description: "Simulates sudden hardware kernel panic or disk controller failure on the primary relational database.",
    severity: "critical",
    triggerEffect: "Terminates primary database process; triggers failover mechanisms."
  },
  {
    id: "cache-flush",
    name: "Redis Cache Eviction Flush (Cold Cache Herd)",
    description: "Simulates sudden in-memory cache eviction or Redis node restart, forcing 100% of read queries to hit the database.",
    severity: "high",
    triggerEffect: "Empties cache keyspace; simulates cold cache thundering herd."
  }
];

export function runChaosSimulation(scenarioId: ChaosScenarioId): ChaosSimulationResult {
  const timestamp = new Date().toLocaleTimeString();

  if (scenarioId === "spike") {
    return {
      scenarioId,
      scenarioName: "10x Traffic Spike (500 -> 5,000 RPS)",
      timestamp,
      contabo: {
        status: "degraded",
        rto: "Manual scaling required",
        dataLoss: "0% (Queue drops incoming requests)",
        explanation: "Contabo VPS S (4 vCPU / 8GB RAM) absorbs initial burst via RAM buffers, but single shared network port limits throughput. CPU reaches 92%, causing HTTP 504 gateway timeouts on 18% of requests.",
        bottleneckNode: "App Compute Node (CPU & IOPS throttling)",
        recoveryAction: "Manual upgrade to VPS L or horizontal addition of second Contabo instance behind Traefik."
      },
      hostinger: {
        status: "survived",
        rto: "Instant (Zero Downtime)",
        dataLoss: "0%",
        explanation: "Hostinger KVM 2/4 with Gen4 NVMe absorbs the surge effortlessly. Docker / Coolify runtime with Traefik keeps P99 latency under 45ms. 300 Mb/s unthrottled network port handles incoming traffic without packet drops. Kodee AI monitors memory thresholds.",
        bottleneckNode: "None (NVMe IOPS throughput handles burst)",
        recoveryAction: "Autoscaling containers or 1-click upgrade to KVM 8 via Hostinger hPanel."
      },
      digitalocean: {
        status: "survived",
        rto: "Instant (Zero Downtime)",
        dataLoss: "0%",
        explanation: "Cloud Load Balancer balances across Droplet nodes. Managed PostgreSQL pool limits backend connections to 25. Minor latency increase (+28ms) during peak burst.",
        bottleneckNode: "Cloud Load Balancer bandwidth pool",
        recoveryAction: "Scale Droplet pool from 2 to 4 nodes in DO dashboard."
      },
      aws: {
        status: "survived",
        rto: "Instant (< 2ms impact)",
        dataLoss: "0%",
        explanation: "CloudFront edge shields 92% of cacheable reads. ALB triggers EC2 Auto-Scaling Group, provisioning additional Graviton2 instances in 90 seconds. Zero dropped connections.",
        bottleneckNode: "Egress billing accumulator",
        recoveryAction: "Auto-scaled EC2 instances naturally scale down when traffic subsides."
      }
    };
  }

  if (scenarioId === "db-crash") {
    return {
      scenarioId,
      scenarioName: "Primary Database Crash (WAL Panic)",
      timestamp,
      contabo: {
        status: "failed",
        rto: "45–120 minutes (Manual sysadmin intervention)",
        dataLoss: "Potential WAL delta loss (last 1-5 mins)",
        explanation: "Self-hosted PostgreSQL on single VPS halts. No automated standby exists. Developer must SSH, inspect corrupted WAL, and restore from automated R2 backup script.",
        bottleneckNode: "Database (Single Point of Failure)",
        recoveryAction: "Manual recovery from Cloudflare R2 backup snapshot."
      },
      hostinger: {
        status: "degraded",
        rto: "2–5 minutes (Snapshot Rollback / Docker restart)",
        dataLoss: "< 1 minute of transactions",
        explanation: "Hostinger automated snapshot allows 1-click restore from hPanel. Docker Compose container restarts automatically (`restart: always`). Kodee AI provides immediate diagnosis prompt with exact restart command.",
        bottleneckNode: "Database Container Restart",
        recoveryAction: "Kodee AI 1-click container reboot or restore from Hostinger weekly backup/snapshot."
      },
      digitalocean: {
        status: "survived",
        rto: "60–90 seconds (Automated Standby Failover)",
        dataLoss: "0% (Synchronous standby)",
        explanation: "DO Managed PostgreSQL detects primary failure, promotes standby node to primary, and updates internal DNS pointer automatically.",
        bottleneckNode: "Standby promotion latency (60s)",
        recoveryAction: "Fully automated failover; new standby provisioned automatically."
      },
      aws: {
        status: "survived",
        rto: "35 seconds (Multi-AZ RDS Promotion)",
        dataLoss: "0% (Synchronous multi-AZ replication)",
        explanation: "Amazon RDS Multi-AZ synchronous replication detects primary crash, flips CNAME to secondary standby in AZ-2 within 35s. PgBouncer reconnects seamlessly.",
        bottleneckNode: "RDS CNAME DNS propagation (30s)",
        recoveryAction: "Zero human intervention required; CloudWatch alerts on-call."
      }
    };
  }

  // Cache Flush
  return {
    scenarioId,
    scenarioName: "Redis Cache Eviction Flush (Cold Cache Herd)",
    timestamp,
    contabo: {
      status: "degraded",
      rto: "3–6 minutes",
      dataLoss: "0% (Cache is ephemeral)",
      explanation: "Every incoming request misses cache and hits unindexed Postgres queries simultaneously. Disk I/O queues spike to 100%. App response times jump to 1,200ms until cache warms back up.",
      bottleneckNode: "PostgreSQL Disk I/O (Cold Cache Thundering Herd)",
      recoveryAction: "Warm cache with synthetic crawler script."
    },
    hostinger: {
      status: "survived",
      rto: "20 seconds (Fast cache re-warm)",
      dataLoss: "0%",
      explanation: "Hostinger Gen4 NVMe disk reads at 3,500 MB/s, absorbing the sudden un-cached query surge without disk queue stalls. Redis container repopulates keys in 20 seconds.",
      bottleneckNode: "Temporary CPU spike during cache re-population",
      recoveryAction: "Redis memory keys repopulate automatically via cache-aside."
    },
    digitalocean: {
      status: "survived",
      rto: "15 seconds",
      dataLoss: "0%",
      explanation: "Managed Redis cluster restarts and re-synchronizes with AOF disk snapshot. App nodes repopulate hot keys rapidly.",
      bottleneckNode: "Managed DB connection pooler leases",
      recoveryAction: "Automatic self-healing."
    },
    aws: {
      status: "survived",
      rto: "Zero impact",
      dataLoss: "0%",
      explanation: "ElastiCache Redis Multi-AZ failover switches to replica in < 5s. Read queries are buffered by CloudFront edge caches, preventing origin stampede.",
      bottleneckNode: "None",
      recoveryAction: "Automatic failover."
    }
  };
}
