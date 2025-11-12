# Redis Configuration with Sentinel and TLS

This directory contains configuration and certificates for Redis with Sentinel support.

## Architecture

The Redis setup includes:
- **1 Redis Master** - Primary Redis instance
- **2 Redis Replicas** - Read replicas for high availability
- **3 Redis Sentinels** - Monitor master/replicas and handle automatic failover

## Features

- **High Availability**: Automatic failover with Redis Sentinel
- **ACL Authentication**: Username/password authentication using Redis ACL (Access Control Lists)
- **TLS Support**: Optional TLS encryption for Redis connections
- **Persistence**: AOF (Append Only File) for data durability
- **Resource Management**: Memory limits with LRU eviction policy

## Configuration

### Environment Variables

Set these in your `.env` file in the root directory:

```bash
# Redis Authentication
REDIS_USERNAME=default
REDIS_PASSWORD=your-secure-redis-password

# Redis Sentinel (for high availability)
REDIS_SENTINEL_ENABLED=true
REDIS_MASTER_NAME=mymaster

# Redis TLS (optional)
REDIS_TLS_ENABLED=false
REDIS_TLS_REJECT_UNAUTHORIZED=true
```

### Docker Compose Setup

The `docker-compose.yml` includes:

1. **redis-master**: Main Redis instance (port 6379)
2. **redis-replica-1**: First replica
3. **redis-replica-2**: Second replica
4. **redis-sentinel-1**: Sentinel instance (port 26379)
5. **redis-sentinel-2**: Sentinel instance (port 26380)
6. **redis-sentinel-3**: Sentinel instance (port 26381)

### ACL Authentication

Redis uses ACL (Access Control Lists) for username/password authentication:

**How It Works:**
- Each Redis instance creates a `users.acl` file on startup
- Two users are configured: `default` and your custom `REDIS_USERNAME`
- Both users have full permissions (`~* &* +@all`)
- Replicas authenticate to master using `masteruser` and `masterauth`
- Sentinels authenticate using `sentinel auth-user` and `sentinel auth-pass`

**ACL File Format:**
```
user default on >your-password ~* &* +@all
user myuser on >your-password ~* &* +@all
```

**ACL Permissions Explained:**
- `on` - User is active
- `>password` - Hashed password (Redis handles hashing)
- `~*` - Access to all keys
- `&*` - Access to all channels (pub/sub)
- `+@all` - All commands allowed

### Sentinel Configuration

Sentinels are configured with:
- **Quorum**: 2 (requires 2 sentinels to agree on failure)
- **Down After**: 5000ms (time before marking master as down)
- **Failover Timeout**: 10000ms (time to complete failover)
- **Parallel Syncs**: 1 (number of replicas that can sync at once)
- **Auth**: Uses username/password to connect to master/replicas

## TLS Setup (Optional)

### Generate Self-Signed Certificates

To enable TLS, first generate certificates:

```bash
# Create certs directory
mkdir -p redis/certs
cd redis/certs

# Generate CA private key
openssl genrsa -out ca.key 4096

# Generate CA certificate
openssl req -new -x509 -days 365 -key ca.key -out ca.crt \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=Redis-CA"

# Generate Redis server private key
openssl genrsa -out redis.key 4096

# Generate Redis server certificate signing request
openssl req -new -key redis.key -out redis.csr \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=redis-master"

# Sign the Redis certificate with the CA
openssl x509 -req -days 365 -in redis.csr -CA ca.crt -CAkey ca.key \
  -CAcreateserial -out redis.crt

# Set proper permissions
chmod 600 redis.key ca.key
chmod 644 redis.crt ca.crt

# Clean up CSR
rm redis.csr
```

### Enable TLS in Redis

Update your `.env` file:

```bash
REDIS_TLS_ENABLED=true
REDIS_TLS_REJECT_UNAUTHORIZED=true
```

Update Redis configuration in `docker-compose.yml` to use TLS:

```yaml
redis-master:
  command: >
    redis-server
    --requirepass ${REDIS_PASSWORD:-your-redis-password}
    --masterauth ${REDIS_PASSWORD:-your-redis-password}
    --tls-port 6379
    --port 0
    --tls-cert-file /etc/redis/certs/redis.crt
    --tls-key-file /etc/redis/certs/redis.key
    --tls-ca-cert-file /etc/redis/certs/ca.crt
    --tls-auth-clients no
```

## Usage

### Start Redis Cluster

```bash
# Start all services
docker-compose up -d

# Check Redis master status (using username and password)
docker exec -it simbox-redis-master redis-cli --user default --pass your-redis-password ping

# Check replication status
docker exec -it simbox-redis-master redis-cli --user default --pass your-redis-password info replication

# View ACL users
docker exec -it simbox-redis-master redis-cli --user default --pass your-redis-password ACL LIST

# Check sentinel status
docker exec -it simbox-redis-sentinel-1 redis-cli -p 26379 sentinel masters
```

### Test Failover

```bash
# Stop the master to test automatic failover
docker stop simbox-redis-master

# Wait 5-10 seconds and check which replica was promoted
docker exec -it simbox-redis-sentinel-1 redis-cli -p 26379 sentinel masters

# Restart the old master (it will become a replica)
docker start simbox-redis-master
```

### Connect from Application

#### Standard Mode (Direct to Master)

```bash
REDIS_SENTINEL_ENABLED=false
REDIS_HOST=redis-master
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

#### Sentinel Mode (Recommended for Production)

```bash
REDIS_SENTINEL_ENABLED=true
REDIS_SENTINELS=redis-sentinel-1:26379,redis-sentinel-2:26379,redis-sentinel-3:26379
REDIS_MASTER_NAME=mymaster
REDIS_PASSWORD=your-redis-password
```

## Monitoring

### View Redis Logs

```bash
# Master logs
docker logs -f simbox-redis-master

# Replica logs
docker logs -f simbox-redis-replica-1
docker logs -f simbox-redis-replica-2

# Sentinel logs
docker logs -f simbox-redis-sentinel-1
docker logs -f simbox-redis-sentinel-2
docker logs -f simbox-redis-sentinel-3
```

### Monitor Redis Metrics

```bash
# Connect to Redis CLI with ACL authentication
docker exec -it simbox-redis-master redis-cli --user default --pass your-redis-password

# Get server info
INFO

# Get replication info
INFO replication

# Get memory usage
INFO memory

# Get client connections
CLIENT LIST

# View ACL users and permissions
ACL LIST

# View current user
ACL WHOAMI
```

## Security Best Practices

1. **Strong Authentication**:
   - Use a unique username (not 'default' in production)
   - Use strong, randomly generated passwords (32+ characters)
   - Change `REDIS_USERNAME` from 'default' to a custom username

2. **ACL Permissions**:
   - Limit user permissions based on needs
   - Create separate users for different applications
   - Use read-only users for monitoring tools

3. **Enable TLS**: Use TLS in production environments

4. **Limit Network Access**: Use firewalls to restrict Redis access

5. **Regular Backups**: Backup Redis data regularly

6. **Monitor Logs**: Watch for unauthorized access attempts

7. **Update Regularly**: Keep Redis and Sentinel updated

8. **Disable Default User**: In production, disable the 'default' user
   ```bash
   # In users.acl file
   user default off nopass ~* &* +@all
   user myapp on >strong-password ~* &* +@all
   ```

## Troubleshooting

### Sentinel Not Detecting Master

Check sentinel logs:
```bash
docker logs simbox-redis-sentinel-1
```

Ensure master is reachable:
```bash
docker exec -it simbox-redis-sentinel-1 ping redis-master
```

### Replicas Not Syncing

Check replication status:
```bash
docker exec -it simbox-redis-master redis-cli --user default --pass your-password INFO replication
```

Verify username and password are correct:
```bash
docker exec -it simbox-redis-replica-1 redis-cli --user default --pass your-password ping
```

Check ACL configuration:
```bash
docker exec -it simbox-redis-replica-1 cat /data/users.acl
```

### Connection Refused

Check if Redis is running:
```bash
docker ps | grep redis
```

Verify port is exposed:
```bash
docker port simbox-redis-master
```

### TLS Connection Errors

Verify certificates exist:
```bash
ls -la redis/certs/
```

Check certificate validity:
```bash
openssl x509 -in redis/certs/redis.crt -text -noout
```

## Performance Tuning

### Memory Management

Redis is configured with:
- **maxmemory**: 256MB (adjust based on your needs)
- **maxmemory-policy**: allkeys-lru (evicts least recently used keys)

To adjust, update the `docker-compose.yml`:

```yaml
--maxmemory 512mb  # Increase to 512MB
```

### Persistence

Currently using AOF (Append Only File) for durability. To change:

```yaml
--appendonly yes      # AOF enabled
--appendfsync everysec  # Sync every second (good balance)
```

## Production Considerations

1. **Resource Allocation**: Allocate sufficient memory for Redis
2. **Network Latency**: Place Redis close to application servers
3. **Backup Strategy**: Implement automated backups
4. **Monitoring**: Use Redis monitoring tools (Redis Insights, Prometheus)
5. **Scaling**: Consider Redis Cluster for horizontal scaling
6. **Security**: Always use TLS and authentication in production

## References

- [Redis Sentinel Documentation](https://redis.io/docs/management/sentinel/)
- [Redis Security](https://redis.io/docs/management/security/)
- [Redis TLS](https://redis.io/docs/management/security/encryption/)
- [Bull Queue](https://github.com/OptimalBits/bull)
