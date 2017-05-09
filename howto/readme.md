# Разные полезные замечания
## Стартануть Redis

To have launchd start redis now and restart at login:

```bash
brew services start redis
```

Or, if you don't want/need a background service you can just run:

```bash
  redis-server /usr/local/etc/redis.conf
```

## Стартануть MongoDB
To have launchd start mongodb now and restart at login:

```bash
brew services start mongodb
```

Or, if you don't want/need a background service you can just run:

```bash
mongod --config /usr/local/etc/mongod.conf
```

