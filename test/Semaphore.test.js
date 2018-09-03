const uuid = require('uuid')
const supertest = require('supertest')
const {
    expect,
    assert
} = require('chai')

const api = supertest('http://localhost:8080/v1/semaphore')
const seat = 1
let testkey = uuid.v4()

describe('Test Semaphore Api', () => {

    before('Test Environment', done => {
        api.get(`/${testkey}notExistKey`).expect(404).end((err, res) => {
            if (err) {
                done(err);
                return;
            }
            done();
        })
    })

    describe('Create Semaphore', () => {

        it('create semaphore', done => {
            api.post(`/${testkey}`).send({
                'seat': seat
            }).expect(200).end((err, res) => {
                if (err) {
                    done(err);
                    return;
                }
                expect(res.body).to.have.property('id');
                expect(res.body).to.have.property('seat');
                assert(res.body.seat === seat)
                assert(res.body.id === testkey)
                done()
            })
        })

        it('create Semaphore again with same key', done => {
            api.post(`/${testkey}`).send({
                'seat': seat
            }).expect(409).end((err, res) => {
                if (err) {
                    done(err);
                    return;
                }
                expect(res.body).to.have.property('message');
                assert(res.body.message === 'Lock In Use')
                done()
            })
        })
    })

    describe('Get Semaphore Status', function () {

        it('get semaphore status', done => {
            api.get(`/${testkey}`).expect(200).end((err, res) => {
                if (err) {
                    done(err);
                    return;
                }
                expect(res.body).to.have.property('id');
                expect(res.body).to.have.property('seat');
                expect(res.body).to.have.property('occupied');
                assert(res.body.seat === seat)
                assert(res.body.occupied === 0)
                done();
            })
        })

        it('get semaphore status with not existing key', done => {
            api.get(`/${testkey}notexistingkey`).expect(404).end((err, res) => {
                if (err) {
                    done(err);
                    return;
                }
                expect(res.body).to.have.property('message');
                assert(res.body.message === 'Key Not Exist')
                done();
            })
        })
    })

    describe('Acquires a seat', function () {
        let handler;
        let expiry;

        it('Acquires a seat with not exist semaphore', done => {
            api.post(`/${testkey}notExisting/seat`).expect(404).end((err, res) => {
                if (err) {
                    done(err);
                    return;
                }
                expect(res.body).to.have.property('message');
                assert(res.body.message === 'Key Not Exist')
                done()
            })
        })

        it('Acquires a seat from semaphore', done => {
            api.post(`/${testkey}/seat`).send({
                ttl: 1
            }).expect(200).end((err, res) => {
                if (err) {
                    done(err);
                    return;
                }
                expect(res.body).to.have.property('id');
                expect(res.body).to.have.property('handler');
                expect(res.body).to.have.property('expiry');
                expiry = res.body.expiry
                done()
            })
        })

        it('Acquires a seat again until expiry', done => {
            setTimeout(() => {
                api.post(`/${testkey}/seat`).expect(200).end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    handler = res.body.handler
                    done()
                })
            }, expiry * 1000 - Date.now())
        })

        it('Acquires a seat again immediately', done => {
            api.post(`/${testkey}/seat`).expect(409).end((err, res) => {
                if (err) {
                    done(err);
                    return;
                }
                expect(res.body).to.have.property('message');
                assert(res.body.message === 'No Seat Available')
                done()
            })
        })

        it('Releases a seat from semaphore', done => {
            api.delete(`/${testkey}/seat/${handler}`).expect(200).end((err, res) => {
                if (err) {
                    done(err);
                    return;
                }
                done()
            })
        })

        it('Releases a seat with not exist handler', done => {
            api.delete(`/${testkey}/seat/${handler}notexist`).expect(200).end((err, res) => {
                if (err) {
                    done(err);
                    return;
                }
                done()
            })
        })
    })

    describe('Delete semaphore', function () {

        it('delete not exist semaphore', done => {
            api.delete(`/${testkey}noExist`).expect(200).end((err, res) => {
                if (err) {
                    done(err)
                    return
                }
                done()
            })
        })

        it('delete semaphore when someone occupy a seat', done => {
            api.post(`/${testkey}/seat`).send({
                ttl: 60
            }).expect(200).end((err, res) => {
                if (err) {
                    done(err)
                    return
                }
                const {
                    handler
                } = res.body
                api.delete(`/${testkey}`).expect(409).end((err, res) => {
                    if (err) {
                        done(err)
                        return
                    }
                    expect(res.body).to.have.property('message');
                    assert(res.body.message === 'Lock In Use')

                    api.delete(`/${testkey}/seat/${handler}`).expect(200).end((err, res) => {
                        if (err) {
                            throw err
                        }
                        done()
                    })
                })
            })
        })

        it('delete semaphore when seat expired', done => {
            api.post(`/${testkey}/seat`).send({
                ttl: 1
            }).expect(200).end((err, res) => {
                if (err) {
                    done(err)
                    return
                }
                const {
                    expiry
                } = res.body
                setTimeout(function () {
                    api.delete(`/${testkey}`).expect(200).end((err, res) => {
                        if (err) {
                            throw err
                        }
                        done()
                    })
                }, expiry * 1000 - Date.now())
            })
        })
    })
})