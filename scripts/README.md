# 📜 AIMY Platform Scripts

This directory contains utility scripts for the AIMY Platform.

## 🚀 Available Scripts

### Proof of Reserve (PoR) Generator
- **`generate-por.js`** - Main PoR report generator
  - Queries database for assets and valuations
  - Verifies blockchain token states
  - Calculates reserve ratios
  - Generates comprehensive JSON reports

### PoR Scheduler
- **`schedule-por.sh`** - Sets up automated daily PoR generation
  - Creates cron job for 9:00 AM daily reports
  - Manages log rotation
  - Easy setup and removal

## 📊 Usage

### Generate PoR Report
```bash
# Manual generation
make por

# Or directly
node scripts/generate-por.js
```

### Setup Automated Generation
```bash
# Setup daily cron job
make por:schedule

# Or directly
./scripts/schedule-por.sh
```

### View Logs
```bash
# View PoR generation logs
make por:logs
```

## 🔧 Configuration

### Environment Variables
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aimy
DB_USER=aimy_user
DB_PASSWORD=aimy_password

# Blockchain
ETHEREUM_RPC_URL=http://localhost:8545
NETWORK_ID=1337

# Output
REPORTS_DIR=./reports
AUDITOR=AIMY System
```

### Output
- Reports are saved to `/reports/proof-of-reserve-YYYY-MM-DD.json`
- Logs are written to `/logs/por-generation.log`
- Cron jobs run daily at 9:00 AM

## 📋 Dependencies

Install script dependencies:
```bash
cd scripts
npm install
```

Required packages:
- `pg` - PostgreSQL client
- `ethers` - Ethereum library

## 🧪 Testing

Test the PoR generator:
```bash
# Ensure database is running and seeded
make up
make seed

# Generate report
make por

# Check output
ls -la reports/
cat reports/proof-of-reserve-*.json | jq '.reserve_summary'
```

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Ensure PostgreSQL is running: `make status`
   - Check credentials in environment variables
   - Verify database exists and is seeded

2. **Blockchain Verification Failed**
   - Ensure Hardhat node is running: `make status`
   - Check `ETHEREUM_RPC_URL` environment variable
   - Verify network ID matches

3. **Permission Denied**
   - Make script executable: `chmod +x scripts/schedule-por.sh`
   - Check file ownership: `ls -la scripts/`

4. **Cron Job Not Working**
   - Check cron service: `sudo systemctl status cron`
   - View cron logs: `tail -f /var/log/cron`
   - Test manually: `node scripts/generate-por.js`

### Log Analysis
```bash
# View recent PoR logs
tail -f logs/por-generation.log

# Check cron logs
tail -f /var/log/cron

# View system logs
journalctl -u cron -f
```

## 📚 Next Steps

1. **Customize Reports** - Modify `generate-por.js` for your needs
2. **Add Notifications** - Integrate with Slack/Email for report delivery
3. **Extend Verification** - Add more blockchain verification methods
4. **Multi-Asset Support** - Enhance for different asset types
5. **Regulatory Compliance** - Add jurisdiction-specific requirements

## 🤝 Contributing

To add new scripts:
1. Create the script file
2. Make it executable: `chmod +x scripts/script-name.sh`
3. Add to Makefile if appropriate
4. Update this README
5. Test thoroughly

## 📞 Support

For issues with scripts:
- Check the troubleshooting section above
- Review logs for error messages
- Open a GitHub issue with details
- Contact the AIMY Platform team
