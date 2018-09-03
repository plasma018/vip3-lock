const uuid = require('uuid')
const supertest = require('supertest')
const {
    expect,
    assert
} = require('chai')

const api = supertest('http://localhost:8080/v1/mutex')

let handle;
let expiry;
const testkey = uuid.v4()

describe('Test Mutex Api', function () {

    before('Test Environment', done => {
        api.get(`/${testkey}notExistKey`).expect(404).end((err, res) => {
            if (err) {
                done(err);
                return;
            }
            expect(res.body).to.have.property('message');
            assert(res.body.message === 'MutextKey Or Handler Not Exist');
            done();
        })
    })

    describe('Lock Mutex', function () {
        it('lock mutex', (done) => {
            api.post(`/${testkey}`).send({
                'ttl': 1
            }).expect(200).end((err, res) => {
                if (err) {
                    done(err);
                    return;
                }
                expect(res.body).to.have.property('handle');
                expect(res.body).to.have.property('id');
                expect(res.body).to.have.property('expiry');
                handle = res.body.handle
                expiry = res.body.expiry
                done();
            })
        })

        it('lock mutex again until expiry', (done) => {
            setTimeout(function () {
                api.post(`/${testkey}`).expect(200).end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    assert(res.body.handle !== handle);
                    handle = res.body.handle
                    expiry = res.body.expiry
                    done();
                })
            }, expiry * 1000 - Date.now())
        })

        it('lock mutex again immediately', (done) => {
            api.post(`/${testkey}`).expect(409).end((err, res) => {
                if (err) {
                    done(err);
                    return;
                }
                expect(res.body).to.have.property('message');
                assert(res.body.message === 'Lock In Use');
                done();
            })
        })
    });


    describe('Query Mutex', function () {
        it('query mutex status', (done) => {
            api.get(`/${testkey}`).expect(200).end((err, res) => {
                if (err) {
                    done(err);
                    return;
                }
                expect(res.body).to.have.property('id');
                expect(res.body).to.have.property('expiry');
                done();
            })
        })

        it('query not exist mutex', (done) => {
            api.get("/" + uuid.v4()).expect(404).end((err, res) => {
                if (err) {
                    done(err);
                    return;
                }
                expect(res.body).to.have.property('message');
                assert(res.body.message === 'MutextKey Or Handler Not Exist');
                done();
            })
        })
    });

    describe('Update Mutex TTL', function () {
        it('update ttl', done => {
            api.patch(`/${testkey}/` + handle).send({
                'ttl': 1000
            }).expect(200).end((err, res) => {
                if (err) {
                    done(err);
                    return;
                }
                expect(res.body).to.have.property('handle');
                expect(res.body).to.have.property('id');
                expect(res.body).to.have.property('expiry');
                assert(res.body.expiry === expiry + 1000);
                done();
            })
        })

        it('update ttl no ttl body', done => {
            api.patch(`/${testkey}/` + handle).expect(400).end((err, res) => {
                if (err) {
                    done(err);
                    return;
                }
                expect(res.body).to.have.property('message');
                assert(res.body.message === 'TTL Format Error Or Not Exist');
                done();
            })
        })

        it('update ttl when handler error', done => {
            api.patch(`/${testkey}/` + 'errorhandler').send({
                'ttl': 1000
            }).expect(404).end((err, res) => {
                if (err) {
                    done(err);
                    return;
                }
                expect(res.body).to.have.property('message');
                assert(res.body.message === 'MutextKey Or Handler Not Exist');
                done();
            })
        })
    })

    describe('Delete Mutex', function () {
        it('delete mutex', done => {
            api.delete(`/${testkey}/` + handle).expect(200).end((err, res) => {
                if (err) {
                    done(err);
                    return;
                }
                done();
            })
        })

        it('delete not exist mutex', done => {
            api.delete(`/${testkey}/` + handle).expect(200).end((err, res) => {
                if (err) {
                    done(err);
                    return;
                }
                done();
            })
        })
    })
})